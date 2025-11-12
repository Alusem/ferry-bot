<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VesselSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem dados
        if (DB::table('vessels')->count() > 0) {
            $this->command->info('Vessels já existem no banco de dados. Pulando seed.');
            return;
        }

        DB::table('vessels')->insert([
            [
                'name' => 'Ferry Bot 01',
                'capacity' => 50,
                'status' => 'Operacional',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Ferry Bot 02',
                'capacity' => 50,
                'status' => 'Operacional',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Ferry Bot 03',
                'capacity' => 50,
                'status' => 'Em Manutenção',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Ferry Bot 04',
                'capacity' => 50,
                'status' => 'Operacional',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ]);

        $this->command->info('4 embarcações criadas com sucesso!');
    }
}
