<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * @var array<int, class-string|string>
     */
    protected $middleware = [
        // Aquí van los middlewares que se ejecutan en CADA petición.
        // Por ejemplo, HandleCors, PreventRequestsDuringMaintenance, etc.
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array<string, array<int, class-string|string>>
     */
    protected $middlewareGroups = [
        'web' => [
            // middlewares específicos para rutas web
        ],

        'api' => [
            // middlewares específicos para rutas api (throttle, bindings, etc.)
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * The application's route middleware.
     *
     * Estos son los middlewares que puedes asignar individualmente a tus rutas.
     * @var array<string, class-string|string>
     */
    protected $routeMiddleware = [
    // ... otros middlewares existentes (ej. 'auth', 'can', etc.)
    
    // REGISTRO DE TU MIDDLEWARE
        'role.check' => \App\Http\Middleware\RoleCheckMiddleware::class, // <-- ¡AÑADE ESTA LÍNEA!
    ];
}