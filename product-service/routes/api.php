<?php

use Illuminate\Support\Facades\Route;
// Asegúrate de usar el namespace correcto (API o Api)
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\SettingController;

/*
|--------------------------------------------------------------------------
| Rutas Públicas (Lectura)
|--------------------------------------------------------------------------
| Cualquiera puede ver productos y categorías
*/
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Escritura)
|--------------------------------------------------------------------------
| Aquí viene el truco. Como los usuarios están en otro lado,
| temporalmente quitamos el middleware 'auth:api' estándar 
| hasta que definas cómo validarás que la petición viene de tu otro servicio.
*/

// Categorías (Crear, Editar, Eliminar)
Route::post('/categories', [CategoryController::class, 'store']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

// Productos (Crear, Editar, Eliminar)
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

// Settings
Route::apiResource('settings', SettingController::class);