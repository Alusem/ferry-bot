<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS (Cross-Origin Resource Sharing) Configuration
    |--------------------------------------------------------------------------
    |
    | Aqui pode configurar as definições para o Cross-Origin Resource Sharing.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Adicione o endereço do seu frontend React AQUI:
        'http://localhost:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];