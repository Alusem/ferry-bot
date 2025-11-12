<?php

namespace App\Http\Controllers;

use App\Models\Vessel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Controller para gerenciar embarcações (Vessels)
 */
class VesselController extends Controller
{
    /**
     * Display a listing of the vessels.
     */
    public function index(): JsonResponse
    {
        $vessels = Vessel::with(['trips' => function ($query) {
            $query->whereIn('status', ['agendada', 'em_curso']);
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $vessels,
            'message' => 'Embarcações recuperadas com sucesso'
        ]);
    }

    /**
     * Store a newly created vessel in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1|max:1000',
            'status' => 'sometimes|string|in:Operacional,Em Manutenção',
        ]);

        $vessel = Vessel::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $vessel,
            'message' => 'Embarcação criada com sucesso'
        ], 201);
    }

    /**
     * Display the specified vessel.
     */
    public function show(Vessel $vessel): JsonResponse
    {
        $vessel->load(['trips' => function ($query) {
            $query->orderBy('departure_time');
        }]);

        return response()->json([
            'success' => true,
            'data' => $vessel,
            'message' => 'Embarcação recuperada com sucesso'
        ]);
    }

    /**
     * Update the specified vessel in storage.
     */
    public function update(Request $request, Vessel $vessel): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'capacity' => 'sometimes|integer|min:1|max:1000',
            'status' => 'sometimes|string|in:Operacional,Em Manutenção',
        ]);

        $vessel->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $vessel,
            'message' => 'Embarcação atualizada com sucesso'
        ]);
    }

    /**
     * Remove the specified vessel from storage.
     */
    public function destroy(Vessel $vessel): JsonResponse
    {
        // Verificar se há viagens ativas
        if ($vessel->activeTrips()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir embarcação com viagens ativas'
            ], 422);
        }

        $vessel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Embarcação excluída com sucesso'
        ]);
    }

    /**
     * Get available vessels for a specific time period.
     */
    public function available(Request $request): JsonResponse
    {
        $request->validate([
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $startTime = $request->input('start_time');
        $endTime = $request->input('end_time');

        $availableVessels = Vessel::whereDoesntHave('trips', function ($query) use ($startTime, $endTime) {
            $query->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('departure_time', [$startTime, $endTime])
                  ->orWhere(function ($subQuery) use ($startTime, $endTime) {
                      $subQuery->where('departure_time', '<=', $startTime)
                               ->whereRaw('departure_time + INTERVAL \'2 hours\' >= ?', [$endTime]);
                  });
            })
            ->whereIn('status', ['agendada', 'em_curso']);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $availableVessels,
            'message' => 'Embarcações disponíveis recuperadas com sucesso'
        ]);
    }

    /**
     * Get vessel statistics.
     */
    public function stats(Vessel $vessel): JsonResponse
    {
        $stats = [
            'total_trips' => $vessel->trips()->count(),
            'active_trips' => $vessel->activeTrips()->count(),
            'completed_trips' => $vessel->trips()->where('status', 'concluida')->count(),
            'total_capacity' => $vessel->capacity,
            'average_utilization' => $vessel->trips()
                ->where('status', 'concluida')
                ->withCount('bookings')
                ->get()
                ->avg('bookings_count') ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Estatísticas da embarcação recuperadas com sucesso'
        ]);
    }
}





