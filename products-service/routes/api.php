<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\orderController;
use App\Http\Controllers\orderItemController;
use App\Http\Controllers\productController;
use App\Http\Controllers\categoryController;

Route::middleware( 'jwt')->group(function () {
    Route::apiResource('orders', orderController::class);
    Route::apiResource('order-items', orderItemController::class);
    Route::apiResource('products', productController::class);
    Route::apiResource('categories', categoryController::class);
});