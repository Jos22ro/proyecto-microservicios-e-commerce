<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\CategoryResource;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
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
        return CategoryResource::collection($categories);
    }
    public function show($id)
    {
        $category = Category::find($id);
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
    }
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        $category->update($request->all());
        return new CategoryResource($category);
    }
    public function destroy($id)
    {
        $category = Category::find($id);
        $category->delete();
        return new CategoryResource($category);
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
