<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Validator;
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
        return response()->json($categories);
    }
    public function show($id)
    {
        $category = Category::find($id);
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
    }
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
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
    }
    public function destroy($id)
    {
        $category = Category::find($id);
        $category->delete();
        return response()->json($category);
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
