<?php

namespace App\Http\Controllers;

use App\Models\Vessel;
use App\Models\Trip;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SimulationController extends Controller
{
    /**
     * Get real system data for simulation.
     */
    public function getSimulationData(Request $request): JsonResponse
    {
        $simulationDate = $request->input('date', Carbon::now()->format('Y-m-d'));
        $date = Carbon::parse($simulationDate)->startOfDay();
        $nextDay = $date->copy()->addDay();

        // Buscar todas as embarcações
        $vessels = Vessel::all();
        
        // Separar embarcações operacionais e em manutenção
        $operationalVessels = $vessels->where('status', 'Operacional');
        $maintenanceVessels = $vessels->where('status', 'Em Manutenção');

        // Calcular capacidade total
        $totalCapacity = $operationalVessels->sum('capacity');
        $avgCapacity = $operationalVessels->count() > 0 
            ? $operationalVessels->avg('capacity') 
            : 50;

        // Buscar viagens agendadas para a data
        $scheduledTrips = Trip::whereBetween('departure_time', [$date, $nextDay])
            ->where('status', 'agendada')
            ->with('vessel')
            ->orderBy('departure_time')
            ->get();

        // Buscar reservas confirmadas para as viagens do dia
        $tripIds = $scheduledTrips->pluck('id');
        $confirmedBookings = Booking::whereIn('trip_id', $tripIds)
            ->where('status', 'confirmada')
            ->get();

        // Calcular distribuição de reservas por horário
        $bookingsByHour = [];
        foreach ($confirmedBookings as $booking) {
            $trip = $scheduledTrips->firstWhere('id', $booking->trip_id);
            if ($trip) {
                $hour = Carbon::parse($trip->departure_time)->hour;
                if (!isset($bookingsByHour[$hour])) {
                    $bookingsByHour[$hour] = 0;
                }
                $bookingsByHour[$hour]++;
            }
        }

        // Calcular total de reservas
        $totalReservations = $confirmedBookings->count();
        
        // Estimar chegadas não reservadas (baseado em histórico ou padrão)
        // Por enquanto, vamos usar uma estimativa baseada no número de viagens
        $estimatedWalkIns = $scheduledTrips->count() * 10; // Estimativa conservadora

        // Calcular horas de operação baseado nas viagens
        $operationStart = 6; // 6h
        $operationEnd = 22; // 22h
        if ($scheduledTrips->count() > 0) {
            $firstTrip = $scheduledTrips->first();
            $lastTrip = $scheduledTrips->last();
            $operationStart = Carbon::parse($firstTrip->departure_time)->hour;
            $operationEnd = Carbon::parse($lastTrip->departure_time)->hour + 2; // +2h para viagem completa
        }

        return response()->json([
            'success' => true,
            'data' => [
                'vessels' => [
                    'total' => $vessels->count(),
                    'operational' => $operationalVessels->count(),
                    'in_maintenance' => $maintenanceVessels->count(),
                    'list' => $vessels->map(function ($vessel) {
                        return [
                            'id' => $vessel->id,
                            'name' => $vessel->name,
                            'capacity' => $vessel->capacity,
                            'status' => $vessel->status
                        ];
                    })
                ],
                'capacity' => [
                    'total' => $totalCapacity,
                    'average' => round($avgCapacity),
                    'per_vessel' => $operationalVessels->map(function ($v) {
                        return $v->capacity;
                    })->toArray()
                ],
                'trips' => [
                    'scheduled_count' => $scheduledTrips->count(),
                    'list' => $scheduledTrips->map(function ($trip) {
                        return [
                            'id' => $trip->id,
                            'departure_time' => $trip->departure_time,
                            'vessel_id' => $trip->vessel_id,
                            'vessel_name' => $trip->vessel->name ?? 'N/A',
                            'trajeto' => $trip->trajeto,
                            'status' => $trip->status
                        ];
                    })
                ],
                'bookings' => [
                    'total_confirmed' => $totalReservations,
                    'by_hour' => $bookingsByHour,
                    'estimated_walk_ins' => $estimatedWalkIns
                ],
                'operation' => [
                    'start_hour' => $operationStart,
                    'end_hour' => $operationEnd,
                    'total_hours' => $operationEnd - $operationStart
                ],
                'warnings' => $this->generateWarnings($operationalVessels, $maintenanceVessels, $scheduledTrips)
            ],
            'message' => 'Dados de simulação recuperados com sucesso'
        ]);
    }

    /**
     * Generate warnings for simulation.
     */
    private function generateWarnings($operationalVessels, $maintenanceVessels, $scheduledTrips): array
    {
        $warnings = [];

        if ($maintenanceVessels->count() > 0) {
            $warnings[] = [
                'type' => 'maintenance',
                'severity' => 'warning',
                'message' => "{$maintenanceVessels->count()} embarcação(ões) em manutenção: " . 
                           $maintenanceVessels->pluck('name')->join(', '),
                'vessels' => $maintenanceVessels->pluck('name')->toArray()
            ];
        }

        if ($operationalVessels->count() === 0) {
            $warnings[] = [
                'type' => 'no_vessels',
                'severity' => 'error',
                'message' => 'Nenhuma embarcação operacional disponível!'
            ];
        }

        if ($scheduledTrips->count() === 0) {
            $warnings[] = [
                'type' => 'no_trips',
                'severity' => 'info',
                'message' => 'Nenhuma viagem agendada para esta data.'
            ];
        }

        return $warnings;
    }
}

