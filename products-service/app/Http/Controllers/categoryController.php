<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Validator;
<<<<<<< HEAD
use App\Http\Resources\CategoryResource;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
=======
>>>>>>> bb14d22 (cambios requeridos)
class categoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        if ($categories->isEmpty()) {
            return response()->json([
                'message' => 'No categories found'
            ], 404);
        }
<<<<<<< HEAD
        return CategoryResource::collection($categories);
=======
        return response()->json($categories);
>>>>>>> bb14d22 (cambios requeridos)
    }
    public function show($id)
    {
        $category = Category::find($id);
<<<<<<< HEAD
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        return new CategoryResource($category);
    }
    public function store(Request $request)
    {
        // Use FormRequest for validation
        $data = $request->all();
        $category = Category::create($data);
        return (new CategoryResource($category))
            ->response()
            ->setStatusCode(201);
=======
        return response()->json($category);
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $category = Category::create($request->all());
        return response()->json($category);
>>>>>>> bb14d22 (cambios requeridos)
    }
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
<<<<<<< HEAD
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        $category->update($request->all());
        return new CategoryResource($category);
=======
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $category->update($request->all());
        return response()->json($category);
>>>>>>> bb14d22 (cambios requeridos)
    }
    public function destroy($id)
    {
        $category = Category::find($id);
        $category->delete();
<<<<<<< HEAD
        return new CategoryResource($category);
=======
        return response()->json($category);
>>>>>>> bb14d22 (cambios requeridos)
    }
    public function search($name)
    {
        $category = Category::where('name', 'like', '%' . $name . '%')->get();
        return response()->json($category);
    }
    public function delete($id)
    {
        $category = Category::find($id);
        $category->delete();
        return response()->json($category);
    }
}
