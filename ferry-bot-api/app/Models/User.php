<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo User (Usuário)
 * 
 * Representa um usuário do sistema.
 * Cada usuário pode fazer múltiplas reservas.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'cpf',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the bookings for the user.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the confirmed bookings for the user.
     */
    public function confirmedBookings(): HasMany
    {
        return $this->hasMany(Booking::class)->where('status', 'confirmada');
    }

    /**
     * Get the upcoming bookings for the user.
     */
    public function upcomingBookings(): HasMany
    {
        return $this->hasMany(Booking::class)
                    ->whereHas('trip', function ($query) {
                        $query->where('departure_time', '>', now());
                    });
    }

    /**
     * Get the completed bookings for the user.
     */
    public function completedBookings(): HasMany
    {
        return $this->hasMany(Booking::class)->where('status', 'concluida');
    }

    /**
     * Check if user has active bookings.
     */
    public function hasActiveBookings(): bool
    {
        return $this->bookings()
                    ->whereIn('status', ['pendente', 'confirmada'])
                    ->exists();
    }

    /**
     * Get user's booking statistics.
     */
    public function getBookingStats(): array
    {
        return [
            'total' => $this->bookings()->count(),
            'confirmed' => $this->confirmedBookings()->count(),
            'completed' => $this->completedBookings()->count(),
            'upcoming' => $this->upcomingBookings()->count(),
        ];
    }
}





