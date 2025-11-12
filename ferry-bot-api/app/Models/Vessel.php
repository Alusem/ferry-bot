<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo Vessel (Embarcação)
 * 
 * Representa uma embarcação do sistema de ferries.
 * Cada embarcação tem um nome e uma capacidade máxima de veículos.
 */
class Vessel extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'capacity',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capacity' => 'integer',
    ];

    /**
     * Get the trips for the vessel.
     */
    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    /**
     * Get the active trips for the vessel.
     */
    public function activeTrips(): HasMany
    {
        return $this->hasMany(Trip::class)->whereIn('status', ['agendada', 'em_curso']);
    }

    /**
     * Check if the vessel is available for a given time period.
     */
    public function isAvailableForPeriod($startTime, $endTime, $excludeTripId = null): bool
    {
        // Buscar todas as viagens ativas da embarcação
        $activeTrips = $this->trips()
            ->whereIn('status', ['agendada', 'em_curso'])
            ->when($excludeTripId, function ($query) use ($excludeTripId) {
                return $query->where('id', '!=', $excludeTripId);
            })
            ->get();

        // Verificar se alguma viagem conflita com o período solicitado
        foreach ($activeTrips as $trip) {
            $tripStart = $trip->departure_time;
            $tripEnd = $trip->departure_time->copy()->addHours(2);

            // Verificar se há sobreposição de horários
            // Conflito se: (tripStart < endTime && tripEnd > startTime)
            if ($tripStart < $endTime && $tripEnd > $startTime) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the total capacity of all vessels.
     */
    public static function getTotalCapacity(): int
    {
        return static::sum('capacity');
    }

    /**
     * Get vessels with available capacity for a specific trip.
     */
    public static function getAvailableVessels($tripId = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = static::query();
        
        if ($tripId) {
            $query->whereDoesntHave('trips', function ($q) use ($tripId) {
                $q->where('id', '!=', $tripId)
                  ->whereIn('status', ['agendada', 'em_curso']);
            });
        } else {
            $query->whereDoesntHave('trips', function ($q) {
                $q->whereIn('status', ['agendada', 'em_curso']);
            });
        }
        
        return $query->get();
    }
}





