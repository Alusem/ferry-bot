<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', 'confirmed', Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'A senha atual é obrigatória.',
            'current_password.string' => 'A senha atual deve ser uma string.',
            
            'new_password.required' => 'A nova senha é obrigatória.',
            'new_password.string' => 'A nova senha deve ser uma string.',
            'new_password.confirmed' => 'A confirmação da nova senha não confere.',
            'new_password.min' => 'A nova senha deve ter pelo menos 8 caracteres.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'current_password' => 'senha atual',
            'new_password' => 'nova senha',
        ];
    }
}





