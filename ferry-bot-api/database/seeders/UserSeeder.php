<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existe um usuário admin
        if (User::where('email', 'admin@ferry.bot')->exists()) {
            $this->command->info('Usuário admin já existe. Pulando criação.');
            return;
        }

        // Criar usuário admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@ferry.bot',
            'password' => bcrypt('12345678'),
        ]);

        $this->command->info('Usuário admin criado com sucesso!');
        $this->command->info('Email: admin@ferry.bot');
        $this->command->info('Senha: 12345678');
    }
}

