<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VesselController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SimulationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui é onde pode registar as rotas da API para a sua aplicação.
| Estas rotas são carregadas pelo RouteServiceProvider.
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'service' => 'Ferry Bot API'
    ]);
});

// Rotas de autenticação - públicas
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Rotas protegidas de autenticação
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::get('/tokens', [AuthController::class, 'tokens']);
        Route::delete('/tokens/{tokenId}', [AuthController::class, 'revokeToken']);
    });
});

// API Version 1
Route::prefix('v1')->group(function () {
    
    // Rotas públicas - não requerem autenticação
    Route::prefix('public')->group(function () {
        Route::get('trips', [TripController::class, 'index']);
        Route::get('trips/{trip}', [TripController::class, 'show']);
        Route::get('trips/date-range', [TripController::class, 'byDateRange']);
        Route::get('vessels', [VesselController::class, 'index']);
        Route::get('vessels/{vessel}', [VesselController::class, 'show']);
        Route::get('vessels/available', [VesselController::class, 'available']);
    });
    
    // Rotas protegidas - requerem autenticação
    Route::middleware('auth:sanctum')->group(function () {
        
        // Rotas de embarcações (apenas para administradores)
        Route::apiResource('vessels', VesselController::class)->except(['index', 'show']);
        Route::get('vessels/{vessel}/stats', [VesselController::class, 'stats']);
        
        // Rotas de viagens (apenas para administradores)
        Route::apiResource('trips', TripController::class)->except(['index', 'show', 'byDateRange']);
        Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus']);
        Route::get('trips/{trip}/stats', [TripController::class, 'stats']);
        
        // Rotas de reservas (para usuários autenticados)
        Route::apiResource('bookings', BookingController::class);
        Route::patch('bookings/{booking}/confirm', [BookingController::class, 'confirm']);
        Route::patch('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
        Route::patch('bookings/{booking}/complete', [BookingController::class, 'complete']);
        Route::get('bookings/reference/{reference}', [BookingController::class, 'byReference']);
        Route::get('users/{userId}/bookings', [BookingController::class, 'userBookings']);
        
        // Rotas de relatórios e feedback (apenas para administradores)
        Route::get('/reports', [ReportController::class, 'index']); // Feedback dos usuários
        Route::get('/reports/analytics', [ReportController::class, 'analytics']); // Relatórios analíticos
        
        // Rotas de simulação (apenas para administradores)
        Route::get('/simulation/data', [SimulationController::class, 'getSimulationData']); // Dados reais para simulação
        
        // Rota para obter dados do usuário autenticado
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
    });
});

// Fallback route for undefined endpoints
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Endpoint não encontrado',
        'available_endpoints' => [
            'GET /api/health',
            'POST /api/v1/auth/register',
            'POST /api/v1/auth/login',
            'GET /api/v1/public/trips',
            'GET /api/v1/public/vessels',
            'GET /api/v1/vessels (auth required)',
            'GET /api/v1/trips (auth required)',
            'GET /api/v1/bookings (auth required)',
        ]
    ], 404);
});