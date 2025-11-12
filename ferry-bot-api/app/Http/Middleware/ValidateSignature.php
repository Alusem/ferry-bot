<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ValidateSignature as Middleware;
use Symfony\Component\HttpFoundation\Response;

class ValidateSignature extends Middleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$parameters): Response
    {
        return parent::handle($request, $next, ...$parameters);
    }
}





