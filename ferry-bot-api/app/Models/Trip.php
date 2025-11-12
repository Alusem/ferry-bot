<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo Trip (Viagem)
 * 
 * Representa uma viagem de ferry.
 * Cada viagem está associada a uma embarcação e tem um horário de partida e status.
 */
class Trip extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'vessel_id',
        'departure_time',
        'status',
        'trajeto',
        'ocupacao',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'departure_time' => 'datetime',
    ];

    /**
     * Status constants
     */
    const STATUS_SCHEDULED = 'agendada';
    const STATUS_IN_PROGRESS = 'em_curso';
    const STATUS_COMPLETED = 'concluida';
    const STATUS_CANCELLED = 'cancelada';

    /**
     * Get the vessel that owns the trip.
     */
    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }

    /**
     * Get the bookings for the trip.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the confirmed bookings for the trip.
     */
    public function confirmedBookings(): HasMany
    {
        return $this->hasMany(Booking::class)->where('status', 'confirmada');
    }

    /**
     * Get the available capacity for the trip.
     */
    public function getAvailableCapacityAttribute(): int
    {
        $bookedCapacity = $this->confirmedBookings()->count();
        return $this->vessel->capacity - $bookedCapacity;
    }

    /**
     * Check if the trip has available capacity.
     */
    public function hasAvailableCapacity(): bool
    {
        return $this->available_capacity > 0;
    }

    /**
     * Check if the trip can be booked.
     */
    public function canBeBooked(): bool
    {
        return $this->status === self::STATUS_SCHEDULED && 
               $this->hasAvailableCapacity() &&
               $this->departure_time > now();
    }

    /**
     * Get trips by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get upcoming trips.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('departure_time', '>', now())
                    ->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Get trips for a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('departure_time', $date);
    }

    /**
     * Get trips for a specific vessel.
     */
    public function scopeForVessel($query, $vesselId)
    {
        return $query->where('vessel_id', $vesselId);
    }

    /**
     * Get all available status options.
     */
    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_SCHEDULED => 'Agendada',
            self::STATUS_IN_PROGRESS => 'Em Curso',
            self::STATUS_COMPLETED => 'Concluída',
            self::STATUS_CANCELLED => 'Cancelada',
        ];
    }

    /**
     * Update trip status.
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
     * Check if trip is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Check if trip is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if trip is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }
}





