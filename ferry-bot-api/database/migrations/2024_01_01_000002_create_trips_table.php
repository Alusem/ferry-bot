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
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vessel_id')->constrained()->onDelete('cascade');
            $table->timestamp('departure_time');
            $table->string('status')->default('agendada');
            $table->timestamps();
            
            // Índices para otimização
            $table->index('vessel_id');
            $table->index('departure_time');
            $table->index('status');
            $table->index(['departure_time', 'status']);
            
            // Constraint para status válidos
            //$table->check('status IN (\'agendada\', \'em_curso\', \'concluida\', \'cancelada\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};





