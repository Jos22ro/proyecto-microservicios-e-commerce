<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Exception;
use Illuminate\Http\Request;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        $token = $matches[1];
        $secret = env('JWT_SECRET', null);
        $algo = env('JWT_ALGO', 'HS256');

        if (!$secret) {
            return response()->json(['message' => 'JWT secret not configured'], 500);
        }

        try {
            $payload = JWT::decode($token, new Key($secret, $algo));
            // payload is stdClass; try common claim names
            $userId = $payload->user_id ?? $payload->sub ?? null;

            if (!$userId) {
                return response()->json(['message' => 'Invalid token payload'], 401);
            }

            // Inject user_id into request for controllers
            $request->attributes->set('user_id', $userId);

            return $next($request);
        } catch (ExpiredException $e) {
            return response()->json(['message' => 'Token expired'], 401);
        } catch (SignatureInvalidException $e) {
            return response()->json(['message' => 'Invalid token signature'], 401);
        } catch (Exception $e) {
            return response()->json(['message' => 'Invalid token'], 401);
        }
    }
}
