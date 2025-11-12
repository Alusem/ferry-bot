<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Trip;
use App\Models\Booking;
use App\Models\Vessel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource (Feedback dos usuários).
     */
    public function index(): JsonResponse
    {
        $reports = Report::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reports,
            'message' => 'Feedback recuperado com sucesso'
        ]);
    }

    /**
     * Get analytics and reports for managers.
     */
    public function analytics(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Estatísticas gerais de viagens
        $totalTrips = Trip::whereBetween('departure_time', [$start, $end])->count();
        $completedTrips = Trip::whereBetween('departure_time', [$start, $end])
            ->where('status', 'concluida')
            ->count();

        // Estatísticas de reservas
        $totalBookings = Booking::whereBetween('created_at', [$start, $end])->count();
        $confirmedBookings = Booking::whereBetween('created_at', [$start, $end])
            ->where('status', 'confirmada')
            ->count();
        $cancelledBookings = Booking::whereBetween('created_at', [$start, $end])
            ->where('status', 'cancelada')
            ->count();

        // Calcular ocupação total
        $tripsInRange = Trip::whereBetween('departure_time', [$start, $end])
            ->with('vessel')
            ->get();

        $totalCapacity = 0;
        $totalPassengers = 0;

        foreach ($tripsInRange as $trip) {
            if ($trip->vessel) {
                $totalCapacity += $trip->vessel->capacity;
                $confirmedCount = Booking::where('trip_id', $trip->id)
                    ->where('status', 'confirmada')
                    ->count();
                $totalPassengers += $confirmedCount;
            }
        }

        // Viagens por status
        $tripsByStatusData = Trip::whereBetween('departure_time', [$start, $end])
            ->select('status')
            ->get()
            ->groupBy('status')
            ->map(function ($trips) {
                return $trips->count();
            })
            ->toArray();
        
        // Mapear status para nomes legíveis
        $statusMap = [
            'agendada' => 'Agendada',
            'em_curso' => 'Em Curso',
            'concluida' => 'Concluída',
            'cancelada' => 'Cancelada'
        ];
        
        $tripsByStatus = [];
        foreach ($tripsByStatusData as $status => $count) {
            $tripsByStatus[$statusMap[$status] ?? $status] = $count;
        }

        // Desempenho por embarcação
        $vesselsPerformance = Vessel::with(['trips' => function ($query) use ($start, $end) {
            $query->whereBetween('departure_time', [$start, $end]);
        }])->get()->map(function ($vessel) use ($start, $end) {
            $trips = $vessel->trips;
            $tripsCount = $trips->count();
            
            $totalCapacity = $tripsCount * $vessel->capacity;
            $totalPassengers = 0;
            
            foreach ($trips as $trip) {
                $totalPassengers += Booking::where('trip_id', $trip->id)
                    ->where('status', 'confirmada')
                    ->count();
            }

            return [
                'name' => $vessel->name,
                'trips_count' => $tripsCount,
                'total_capacity' => $totalCapacity,
                'total_passengers' => $totalPassengers,
                'status' => $vessel->status
            ];
        });

        // Horários de maior demanda
        $bookingsWithTrips = Booking::whereBetween('bookings.created_at', [$start, $end])
            ->where('bookings.status', 'confirmada')
            ->join('trips', 'bookings.trip_id', '=', 'trips.id')
            ->select('trips.departure_time')
            ->get();

        $hourlyBookings = [];
        foreach ($bookingsWithTrips as $booking) {
            $hour = Carbon::parse($booking->departure_time)->hour;
            if (!isset($hourlyBookings[$hour])) {
                $hourlyBookings[$hour] = 0;
            }
            $hourlyBookings[$hour]++;
        }

        arsort($hourlyBookings);
        $peakHours = collect($hourlyBookings)->map(function ($count, $hour) {
            return [
                'hour' => (int)$hour,
                'bookings' => $count
            ];
        })->values();

        // Trajetos mais populares
        $routesData = Trip::whereBetween('departure_time', [$start, $end])
            ->select('trajeto')
            ->get()
            ->groupBy('trajeto')
            ->map(function ($trips, $trajeto) {
                return [
                    'trajeto' => $trajeto,
                    'count' => $trips->count()
                ];
            })
            ->sortByDesc('count')
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'total_trips' => $totalTrips,
                'completed_trips' => $completedTrips,
                'total_bookings' => $totalBookings,
                'confirmed_bookings' => $confirmedBookings,
                'cancelled_bookings' => $cancelledBookings,
                'total_capacity' => $totalCapacity,
                'total_passengers' => $totalPassengers,
                'trips_by_status' => $tripsByStatus,
                'vessels_performance' => $vesselsPerformance,
                'peak_hours' => $peakHours,
                'popular_routes' => $routesData,
            ],
            'message' => 'Relatórios recuperados com sucesso'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
