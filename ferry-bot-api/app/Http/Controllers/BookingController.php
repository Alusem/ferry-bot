<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Controller para gerenciar reservas (Bookings)
 */
class BookingController extends Controller
{
    /**
     * Display a listing of the bookings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['user', 'trip.vessel']);

        // Filtros opcionais
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->has('trip_id')) {
            $query->where('trip_id', $request->input('trip_id'));
        }

        if ($request->has('vehicle_plate')) {
            $query->where('vehicle_plate', 'LIKE', '%' . $request->input('vehicle_plate') . '%');
        }

        if ($request->has('upcoming')) {
            $query->upcoming();
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $bookings,
            'message' => 'Reservas recuperadas com sucesso'
        ]);
    }

    /**
     * Store a newly created booking in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'trip_id' => 'required|exists:trips,id',
            'vehicle_plate' => 'required|string|max:10',
        ]);

        $trip = Trip::findOrFail($request->input('trip_id'));

        // Verificar status da viagem
        if ($trip->status !== 'agendada') {
            return response()->json([
                'success' => false,
                'message' => 'Esta viagem não pode ser reservada. Apenas viagens com status "Agendada" podem ser reservadas.'
            ], 422);
        }

        // Verificar se a viagem é no futuro
        if ($trip->departure_time <= now()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta viagem já partiu ou está em andamento. Não é possível fazer reservas para viagens passadas. A viagem estava agendada para ' . $trip->departure_time->format('d/m/Y H:i') . '.'
            ], 422);
        }

        // Verificar se há capacidade disponível
        if (!$trip->hasAvailableCapacity()) {
            return response()->json([
                'success' => false,
                'message' => 'Não há vagas disponíveis para esta viagem'
            ], 422);
        }

        // Verificar se a viagem pode ser reservada (validação adicional)
        if (!$trip->canBeBooked()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta viagem não pode ser reservada no momento'
            ], 422);
        }

        // Verificar se já existe reserva para este veículo nesta viagem
        $existingBooking = Booking::where('trip_id', $trip->id)
            ->where('vehicle_plate', $request->input('vehicle_plate'))
            ->whereIn('status', ['pendente', 'confirmada'])
            ->first();

        if ($existingBooking) {
            return response()->json([
                'success' => false,
                'message' => 'Já existe uma reserva ativa para este veículo nesta viagem'
            ], 422);
        }

        $booking = Booking::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $booking->load(['user', 'trip.vessel']),
            'message' => 'Reserva criada com sucesso'
        ], 201);
    }

    /**
     * Display the specified booking.
     */
    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['user', 'trip.vessel']);

        return response()->json([
            'success' => true,
            'data' => $booking,
            'message' => 'Reserva recuperada com sucesso'
        ]);
    }

    /**
     * Update the specified booking in storage.
     */
    public function update(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'vehicle_plate' => 'sometimes|string|max:10',
            'status' => 'sometimes|in:pendente,confirmada,cancelada,concluida',
        ]);

        // Se mudando a placa, verificar se não existe outra reserva
        if ($request->has('vehicle_plate') && $request->input('vehicle_plate') !== $booking->vehicle_plate) {
            $existingBooking = Booking::where('trip_id', $booking->trip_id)
                ->where('vehicle_plate', $request->input('vehicle_plate'))
                ->where('id', '!=', $booking->id)
                ->whereIn('status', ['pendente', 'confirmada'])
                ->first();

            if ($existingBooking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Já existe uma reserva ativa para este veículo nesta viagem'
                ], 422);
            }
        }

        $booking->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $booking->load(['user', 'trip.vessel']),
            'message' => 'Reserva atualizada com sucesso'
        ]);
    }

    /**
     * Remove the specified booking from storage.
     */
    public function destroy(Booking $booking): JsonResponse
    {
        // Verificar se a reserva pode ser cancelada
        if (!$booking->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta reserva não pode ser cancelada'
            ], 422);
        }

        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reserva excluída com sucesso'
        ]);
    }

    /**
     * Confirm a booking.
     */
    public function confirm(Booking $booking): JsonResponse
    {
        if (!$booking->canBeConfirmed()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta reserva não pode ser confirmada'
            ], 422);
        }

        $success = $booking->confirm();

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao confirmar reserva'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $booking->load(['user', 'trip.vessel']),
            'message' => 'Reserva confirmada com sucesso'
        ]);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Booking $booking): JsonResponse
    {
        if (!$booking->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta reserva não pode ser cancelada'
            ], 422);
        }

        $success = $booking->cancel();

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar reserva'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $booking->load(['user', 'trip.vessel']),
            'message' => 'Reserva cancelada com sucesso'
        ]);
    }

    /**
     * Complete a booking.
     */
    public function complete(Booking $booking): JsonResponse
    {
        $success = $booking->complete();

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Esta reserva não pode ser concluída'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $booking->load(['user', 'trip.vessel']),
            'message' => 'Reserva concluída com sucesso'
        ]);
    }

    /**
     * Get bookings by reference.
     */
    public function byReference(string $reference): JsonResponse
    {
        $booking = Booking::where('booking_reference', $reference)
            ->with(['user', 'trip.vessel'])
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva não encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $booking,
            'message' => 'Reserva recuperada com sucesso'
        ]);
    }

    /**
     * Get user's bookings.
     */
    public function userBookings(Request $request, int $userId): JsonResponse
    {
        $query = Booking::where('user_id', $userId)
            ->with(['trip.vessel']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('upcoming')) {
            $query->upcoming();
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $bookings,
            'message' => 'Reservas do usuário recuperadas com sucesso'
        ]);
    }
}





