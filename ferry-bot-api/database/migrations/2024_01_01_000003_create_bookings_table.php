<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->string('vehicle_plate');
            $table->string('status')->default('pendente');
            $table->string('booking_reference')->unique();
            $table->timestamps();
            
            // Índices para otimização
            $table->index('user_id');
            $table->index('trip_id');
            $table->index('vehicle_plate');
            $table->index('status');
            $table->index('booking_reference');
            $table->index(['trip_id', 'status']);
            $table->index(['user_id', 'status']);
            
            // Constraint para status válidos
            //$table->check('status IN (\'pendente\', \'confirmada\', \'cancelada\', \'concluida\')');
            
            // Constraint para evitar duplicação de reservas no mesmo trip
            $table->unique(['trip_id', 'vehicle_plate'], 'unique_trip_vehicle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};





