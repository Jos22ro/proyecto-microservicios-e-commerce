<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\orderController;
use App\Http\Controllers\orderItemController;
use App\Http\Controllers\productController;
use App\Http\Controllers\categoryController;

<<<<<<< HEAD
<<<<<<< HEAD
Route::middleware( 'jwt')->group(function () {
=======
Route::middleware('jwt')->group(function () {
>>>>>>> bb14d22 (cambios requeridos)
=======
Route::middleware( 'jwt')->group(function () {
>>>>>>> fix
    Route::apiResource('orders', orderController::class);
    Route::apiResource('order-items', orderItemController::class);
    Route::apiResource('products', productController::class);
    Route::apiResource('categories', categoryController::class);
});