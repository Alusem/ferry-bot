<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo Booking (Reserva)
 * 
 * Representa uma reserva de viagem de ferry.
 * Cada reserva está associada a um usuário e uma viagem, e contém a placa do veículo.
 */
class Booking extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'trip_id',
        'vehicle_plate',
        'status',
        'booking_reference',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Status constants
     */
    const STATUS_PENDING = 'pendente';
    const STATUS_CONFIRMED = 'confirmada';
    const STATUS_CANCELLED = 'cancelada';
    const STATUS_COMPLETED = 'concluida';

    /**
     * Get the user that owns the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the trip that owns the booking.
     */
    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    /**
     * Get the vessel through the trip.
     */
    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class, 'vessel_id', 'id')
                    ->through('trip');
    }

    /**
     * Generate a unique booking reference.
     */
    public static function generateBookingReference(): string
    {
        do {
            $reference = 'FB' . strtoupper(substr(md5(uniqid()), 0, 8));
        } while (static::where('booking_reference', $reference)->exists());
        
        return $reference;
    }

    /**
     * Boot method to generate booking reference.
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($booking) {
            if (empty($booking->booking_reference)) {
                $booking->booking_reference = static::generateBookingReference();
            }
        });
    }

    /**
     * Get all available status options.
     */
    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_PENDING => 'Pendente',
            self::STATUS_CONFIRMED => 'Confirmada',
            self::STATUS_CANCELLED => 'Cancelada',
            self::STATUS_COMPLETED => 'Concluída',
        ];
    }

    /**
     * Check if the booking can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]) &&
               $this->trip->departure_time > now()->addHours(2);
    }

    /**
     * Check if the booking can be confirmed.
     */
    public function canBeConfirmed(): bool
    {
        return $this->status === self::STATUS_PENDING &&
               $this->trip->canBeBooked();
    }

    /**
     * Update booking status.
     */
    public function updateStatus(string $status): bool
    {
        if (!in_array($status, array_keys(self::getStatusOptions()))) {
            return false;
        }

        $this->status = $status;
        return $this->save();
    }

    /**
     * Confirm the booking.
     */
    public function confirm(): bool
    {
        if (!$this->canBeConfirmed()) {
            return false;
        }

        return $this->updateStatus(self::STATUS_CONFIRMED);
    }

    /**
     * Cancel the booking.
     */
    public function cancel(): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        return $this->updateStatus(self::STATUS_CANCELLED);
    }

    /**
     * Complete the booking.
     */
    public function complete(): bool
    {
        if ($this->status !== self::STATUS_CONFIRMED) {
            return false;
        }

        return $this->updateStatus(self::STATUS_COMPLETED);
    }

    /**
     * Get bookings by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get bookings for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get bookings for a specific trip.
     */
    public function scopeForTrip($query, $tripId)
    {
        return $query->where('trip_id', $tripId);
    }

    /**
     * Get upcoming bookings.
     */
    public function scopeUpcoming($query)
    {
        return $query->whereHas('trip', function ($q) {
            $q->where('departure_time', '>', now());
        });
    }

    /**
     * Get bookings by vehicle plate.
     */
    public function scopeByVehiclePlate($query, string $plate)
    {
        return $query->where('vehicle_plate', 'LIKE', "%{$plate}%");
    }

    /**
     * Check if booking is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if booking is confirmed.
     */
    public function isConfirmed(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    /**
     * Check if booking is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if booking is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}





