<?php

use Illuminate\Support\Facades\Route;

// Default welcome route
Route::get('/', function () {
    return response()->json([
        'message' => 'Welcome to the Products Service API',
        'endpoints' => [
            'api' => '/api',
            'docs' => '/docs' // If you have API documentation
        ]
    ]);
});