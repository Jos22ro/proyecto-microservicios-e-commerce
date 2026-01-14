<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleCheckMiddleware
{
    /**
     * Maneja la petición entrante.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role  El rol que se requiere (ej. 'admin')
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. OBTENER EL TOKEN DEL ENCABEZADO
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            // El token no está presente
            return response()->json(['message' => 'No autorizado. Token no proporcionado o formato incorrecto.'], 401);
        }

        $token = substr($authHeader, 7); // Extrae el token (quita "Bearer ")

        // =========================================================================
        // 2. LÓGICA DE DECODIFICACIÓN Y EXTRACCIÓN DEL ROL (DEBES IMPLEMENTARLO)
        // =========================================================================
        
        // ESTO ES UN EJEMPLO CONCEPTUAL. 
        // NECESITAS DECODIFICAR EL JWT AQUÍ USANDO LA CLAVE SECRETA O PÚBLICA 
        // COMPARTIDA CON TU MICROSERVICIO DE AUTENTICACIÓN.
        // *Recomendación:* Usa una librería como `firebase/php-jwt`.

        try {
            // Lógica conceptual: Decodificar el token y extraer el 'role' del payload
            
            // $decodedToken = JWT::decode($token, new Key('TU_CLAVE_SECRETA', 'HS256'));
            // $userRole = $decodedToken->role; 
            
            // Para el ejemplo, forzaremos que, si el token es "VAL", el rol es 'admin'. 
            // **REEMPLAZA ESTO CON LA LÓGICA DE DECODIFICACIÓN REAL**
            
            $userRole = 'guest'; 
            if (strpos($token, 'VAL') !== false) {
                 $userRole = 'admin'; 
            } else if (strpos($token, 'NORMAL') !== false) {
                 $userRole = 'user';
            }

        } catch (\Exception $e) {
            return response()->json(['message' => 'No autorizado. Token inválido o expirado.'], 401);
        }
        
        // 3. LÓGICA DE AUTORIZACIÓN (Verificación del rol)

        if ($userRole !== $role) {
            // El rol del usuario no coincide con el rol requerido (ej. 'admin')
            return response()->json(['message' => 'Acceso denegado. Su rol no tiene permisos para esta acción.'], 403);
        }

        return $next($request);
    }
}