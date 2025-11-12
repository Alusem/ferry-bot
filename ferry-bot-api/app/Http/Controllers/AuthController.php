<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ChangePasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Controller para gerenciar autenticação de usuários
 */
class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'cpf' => $request->cpf,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Usuário registrado com sucesso',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {

        try {
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciais inválidas'
                ], 401);
            }

            $user = User::where('email', $request->email)->firstOrFail();
            
            // Revoke all existing tokens for this user
            $user->tokens()->delete();
            
            // Create new token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login realizado com sucesso',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Revoke the current access token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout realizado com sucesso'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        try {
            // Revoke all tokens for the user
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout de todos os dispositivos realizado com sucesso'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $user->load(['bookings.trip.vessel']);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Dados do usuário recuperados com sucesso'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'cpf' => 'nullable|string|max:14|unique:users,cpf,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dados de validação inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user->update($request->only(['name', 'email', 'phone', 'cpf']));

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Perfil atualizado com sucesso'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {

        try {
            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Senha atual incorreta'
                ], 422);
            }

            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            // Revoke all tokens to force re-login
            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Senha alterada com sucesso. Faça login novamente.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's active tokens
     */
    public function tokens(Request $request): JsonResponse
    {
        try {
            $tokens = $request->user()->tokens()->select(['id', 'name', 'last_used_at', 'created_at'])->get();

            return response()->json([
                'success' => true,
                'data' => $tokens,
                'message' => 'Tokens recuperados com sucesso'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Revoke specific token
     */
    public function revokeToken(Request $request, $tokenId): JsonResponse
    {
        try {
            $user = $request->user();
            $token = $user->tokens()->where('id', $tokenId)->first();

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token não encontrado'
                ], 404);
            }

            $token->delete();

            return response()->json([
                'success' => true,
                'message' => 'Token revogado com sucesso'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
