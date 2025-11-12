<?php

namespace Database\Seeders;

use App\Models\Report;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem dados
        if (DB::table('reports')->count() > 0) {
            $this->command->info('Reports já existem no banco de dados. Pulando seed.');
            return;
        }

        DB::table('reports')->insert([
            [
                'title' => 'Atraso na Viagem das 8h',
                'content' => 'O Ferry Bot 02 saiu com 45 minutos de atraso. A comunicação foi péssima.',
                'status' => 'Pendente',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'title' => 'Casa de banho suja - Ferry Bot 01',
                'content' => 'A casa de banho da embarcação estava inutilizável.',
                'status' => 'Pendente',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'title' => 'Sugestão: Venda de lanches',
                'content' => 'Gostaria de sugerir que houvesse uma máquina de venda de lanches e bebidas a bordo.',
                'status' => 'Resolvido',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ]);

        $this->command->info('3 relatórios criados com sucesso!');
    }
}
