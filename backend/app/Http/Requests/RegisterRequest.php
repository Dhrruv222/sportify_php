<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|max:255',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Z])(?=.*\d).+$/'],
            'role' => 'sometimes|string|in:PLAYER,CLUB,AGENT,SCOUT,COACH,FAN,COMPANY',
            'gdprConsent' => 'required|accepted',
        ];
    }

    public function messages(): array
    {
        return [
            'password.regex' => 'Password must contain at least one uppercase letter and one number.',
            'gdprConsent.accepted' => 'Explicit GDPR consent is required to create an account.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'status' => 'error',
            'message' => $validator->errors()->first(),
        ], 400));
    }
}
