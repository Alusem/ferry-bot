<?php

namespace Database\Seeders;

use App\Models\Trip;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TripSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem dados
        if (DB::table('trips')->count() > 0) {
            $this->command->info('Trips já existem no banco de dados. Pulando seed.');
            return;
        }

        // Criar viagens - algumas passadas (para histórico) e algumas futuras (para reservas)
        $today = now()->startOfDay();
        $tomorrow = now()->addDay()->startOfDay();

        DB::table('trips')->insert([
            // Viagens passadas (para histórico)
            [
                'vessel_id' => 1,
                'departure_time' => $today->copy()->setTime(6, 30)->format('Y-m-d H:i:s'),
                'status' => 'concluida',
                'trajeto' => 'Ponta da Espera -> Cujupe',
                'ocupacao' => '50/50',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'vessel_id' => 3,
                'departure_time' => $today->copy()->setTime(9, 30)->format('Y-m-d H:i:s'),
                'status' => 'cancelada',
                'trajeto' => 'Ponta da Espera -> Cujupe',
                'ocupacao' => '0/50',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            // Viagens futuras (para reservas)
            [
                'vessel_id' => 2,
                'departure_time' => $tomorrow->copy()->setTime(8, 0)->format('Y-m-d H:i:s'),
                'status' => 'agendada',
                'trajeto' => 'Cujupe -> Ponta da Espera',
                'ocupacao' => '15/50',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'vessel_id' => 1,
                'departure_time' => $tomorrow->copy()->setTime(11, 0)->format('Y-m-d H:i:s'),
                'status' => 'agendada',
                'trajeto' => 'Cujupe -> Ponta da Espera',
                'ocupacao' => '32/50',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'vessel_id' => 4,
                'departure_time' => $tomorrow->copy()->setTime(14, 30)->format('Y-m-d H:i:s'),
                'status' => 'agendada',
                'trajeto' => 'Ponta da Espera -> Cujupe',
                'ocupacao' => '28/50',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'vessel_id' => 2,
                'departure_time' => $tomorrow->copy()->setTime(17, 0)->format('Y-m-d H:i:s'),
                'status' => 'em_curso',
                'trajeto' => 'Cujupe -> Ponta da Espera',
                'ocupacao' => '45/50',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ]);

        $this->command->info('6 viagens criadas com sucesso!');
    }
}
