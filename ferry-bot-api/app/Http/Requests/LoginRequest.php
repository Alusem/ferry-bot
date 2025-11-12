<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'O email é obrigatório.',
            'email.string' => 'O email deve ser uma string.',
            'email.email' => 'O email deve ter um formato válido.',
            
            'password.required' => 'A senha é obrigatória.',
            'password.string' => 'A senha deve ser uma string.',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'email' => 'email',
            'password' => 'senha',
        ];
    }
}





