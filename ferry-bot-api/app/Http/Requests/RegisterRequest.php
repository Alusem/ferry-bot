<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'string', 'confirmed', Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()],
            'phone' => 'nullable|string|max:20|regex:/^[\d\s\-\+\(\)]+$/',
            'cpf' => 'nullable|string|max:14|unique:users,cpf|regex:/^\d{3}\.\d{3}\.\d{3}-\d{2}$/',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome é obrigatório.',
            'name.string' => 'O nome deve ser uma string.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
            
            'email.required' => 'O email é obrigatório.',
            'email.string' => 'O email deve ser uma string.',
            'email.email' => 'O email deve ter um formato válido.',
            'email.max' => 'O email não pode ter mais de 255 caracteres.',
            'email.unique' => 'Este email já está em uso.',
            
            'password.required' => 'A senha é obrigatória.',
            'password.string' => 'A senha deve ser uma string.',
            'password.confirmed' => 'A confirmação da senha não confere.',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres.',
            
            'phone.string' => 'O telefone deve ser uma string.',
            'phone.max' => 'O telefone não pode ter mais de 20 caracteres.',
            'phone.regex' => 'O formato do telefone é inválido.',
            
            'cpf.string' => 'O CPF deve ser uma string.',
            'cpf.max' => 'O CPF não pode ter mais de 14 caracteres.',
            'cpf.unique' => 'Este CPF já está em uso.',
            'cpf.regex' => 'O formato do CPF é inválido. Use o formato: 000.000.000-00.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'email' => 'email',
            'password' => 'senha',
            'phone' => 'telefone',
            'cpf' => 'CPF',
        ];
    }
}





