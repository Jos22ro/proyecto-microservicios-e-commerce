<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\ProductResource;

class productController extends Controller
{
    public function index()
    {
        $products = Product::all();
        if ($products->isEmpty()) {
            return response()->json([
                'message' => 'No products found'
            ], 404);
        }
        $products = Product::with('category')->get();

        return ProductResource::collection($products);
    }

    public function show($id)
    {
        $product = Product::with('category')->find($id);
        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }
        return new ProductResource($product);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'brand' => 'required',
            'description' => 'required',
            'price' => 'required|numeric|min:0',
            'sku' => 'required|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $product = Product::create($request->all());
        if (!$product) {
            return response()->json([
                'message' => 'Product not created'
            ], 400);
        }
        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'brand' => 'required',
            'description' => 'required',
            'price' => 'required|numeric|min:0',
            'sku' => 'required',
            'category_id' => 'required|exists:categories,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }
        $product->update($request->all());
        if (!$product) {
            return response()->json([
                'message' => 'Product not actualizado'
            ], 400);
        }
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }
        $product->delete();
        if (!$product) {
            return response()->json([
                'message' => 'Product not eliminado'
            ], 400);
        }
        return response()->json($product);
    }
}
