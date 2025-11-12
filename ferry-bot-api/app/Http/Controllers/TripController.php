<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Vessel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

/**
 * Controller para gerenciar viagens (Trips)
 */
class TripController extends Controller
{
    /**
     * Display a listing of the trips.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Trip::with(['vessel', 'bookings']);

        // Filtros opcionais
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('vessel_id')) {
            $query->where('vessel_id', $request->input('vessel_id'));
        }

        if ($request->has('date')) {
            $query->whereDate('departure_time', $request->input('date'));
        }

        if ($request->has('upcoming')) {
            $query->upcoming();
        }

        $trips = $query->orderBy('departure_time')->get();

        return response()->json([
            'success' => true,
            'data' => $trips,
            'message' => 'Viagens recuperadas com sucesso'
        ]);
    }

    /**
     * Store a newly created trip in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'vessel_id' => 'required|exists:vessels,id',
            'departure_time' => 'required|date|after:now',
            'status' => 'sometimes|in:agendada,em_curso,concluida,cancelada',
            'trajeto' => 'sometimes|string|max:255',
        ]);

        // Verificar se a embarcação está disponível
        $vessel = Vessel::findOrFail($request->input('vessel_id'));
        $departureTime = Carbon::parse($request->input('departure_time'));
        $endTime = $departureTime->copy()->addHours(2);

        if (!$vessel->isAvailableForPeriod($departureTime, $endTime)) {
            return response()->json([
                'success' => false,
                'message' => 'Embarcação não está disponível para o horário selecionado'
            ], 422);
        }

        $trip = Trip::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $trip->load('vessel'),
            'message' => 'Viagem criada com sucesso'
        ], 201);
    }

    /**
     * Display the specified trip.
     */
    public function show(Trip $trip): JsonResponse
    {
        $trip->load(['vessel', 'bookings.user']);

        return response()->json([
            'success' => true,
            'data' => $trip,
            'message' => 'Viagem recuperada com sucesso'
        ]);
    }

    /**
     * Update the specified trip in storage.
     */
    public function update(Request $request, Trip $trip): JsonResponse
    {
        $request->validate([
            'vessel_id' => 'sometimes|exists:vessels,id',
            'departure_time' => 'sometimes|date',
            'status' => 'sometimes|in:agendada,em_curso,concluida,cancelada',
            'trajeto' => 'sometimes|string|max:255',
        ]);

        // Se estiver mudando o horário, validar
        if ($request->has('departure_time')) {
            $newDepartureTime = Carbon::parse($request->input('departure_time'));
            
            // Se estiver tentando mudar uma viagem futura para uma data passada, não permitir
            if ($newDepartureTime->isPast() && $trip->departure_time->isFuture()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível alterar uma viagem futura para uma data passada'
                ], 422);
            }
            
            // Permitir editar viagens passadas (para mudar status, por exemplo)
            // Permitir editar viagens futuras para outras datas futuras
            // A validação "after:now" foi removida para permitir editar viagens passadas
        }

        // Se mudando a embarcação ou horário, verificar disponibilidade
        if ($request->has('vessel_id') || $request->has('departure_time')) {
            $vesselId = $request->input('vessel_id', $trip->vessel_id);
            $departureTime = Carbon::parse($request->input('departure_time', $trip->departure_time));
            
            // Só verificar disponibilidade se a viagem for no futuro
            if ($departureTime->isFuture()) {
                $endTime = $departureTime->copy()->addHours(2);
                $vessel = Vessel::findOrFail($vesselId);
                
                if (!$vessel->isAvailableForPeriod($departureTime, $endTime, $trip->id)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Embarcação não está disponível para o horário selecionado'
                    ], 422);
                }
            }
        }

        $trip->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $trip->load('vessel'),
            'message' => 'Viagem atualizada com sucesso'
        ]);
    }

    /**
     * Remove the specified trip from storage.
     */
    public function destroy(Trip $trip): JsonResponse
    {
        // Verificar se há reservas confirmadas
        if ($trip->confirmedBookings()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir viagem com reservas confirmadas'
            ], 422);
        }

        $trip->delete();

        return response()->json([
            'success' => true,
            'message' => 'Viagem excluída com sucesso'
        ]);
    }

    /**
     * Update trip status.
     */
    public function updateStatus(Request $request, Trip $trip): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:agendada,em_curso,concluida,cancelada',
        ]);

        $success = $trip->updateStatus($request->input('status'));

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Status inválido'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $trip->load('vessel'),
            'message' => 'Status da viagem atualizado com sucesso'
        ]);
    }

    /**
     * Get trips by date range.
     */
    public function byDateRange(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $trips = Trip::with(['vessel', 'bookings'])
            ->whereBetween('departure_time', [
                $request->input('start_date'),
                $request->input('end_date')
            ])
            ->orderBy('departure_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trips,
            'message' => 'Viagens do período recuperadas com sucesso'
        ]);
    }

    /**
     * Get trip statistics.
     */
    public function stats(Trip $trip): JsonResponse
    {
        $stats = [
            'total_bookings' => $trip->bookings()->count(),
            'confirmed_bookings' => $trip->confirmedBookings()->count(),
            'available_capacity' => $trip->available_capacity,
            'utilization_percentage' => round(($trip->confirmedBookings()->count() / $trip->vessel->capacity) * 100, 2),
            'is_full' => !$trip->hasAvailableCapacity(),
            'can_be_booked' => $trip->canBeBooked(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Estatísticas da viagem recuperadas com sucesso'
        ]);
    }
}





