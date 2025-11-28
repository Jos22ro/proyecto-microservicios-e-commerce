<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\OrderItemResource;


class orderItemController extends Controller
{
    public function index()
    {
        $orderItems = OrderItem::all();
        if ($orderItems->isEmpty()) {
            return response()->json([
                'message' => 'No order items found'
            ], 404);
        }
        $orderItems = OrderItem::with(['order', 'product'])->get();
        return OrderItemResource::collection($orderItems);
    }

    public function show($id)
    {
        $orderItem = OrderItem::find($id);
        if (!$orderItem) {
            return response()->json([
                'message' => 'Order item not found'
            ], 404);
        }
        return response()->json($orderItem);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify that the product exists and has enough stock
        $product = Product::find($request->product_id);
        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        // Verify that the order exists
        $order = Order::find($request->order_id);
        if (!$order) {
            return response()->json([
                'message' => 'Order not found'
            ], 404);
        }

        // Create the order item
        $orderItem = OrderItem::create($request->all());
        
        // Update the order total amount
        $this->updateOrderTotal($orderItem->order_id);
        
        return response()->json($orderItem, 201);
    }

    public function update(Request $request, $id)
    {
        $orderItem = OrderItem::find($id);
        if (!$orderItem) {
            return response()->json([
                'message' => 'Order item not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'sometimes|required|integer|min:1',
            'unit_price' => 'sometimes|required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $orderItem->update($request->all());
        
        // Update the order total amount
        $this->updateOrderTotal($orderItem->order_id);
        
        return response()->json($orderItem);
    }

    public function destroy($id)
    {
        $orderItem = OrderItem::find($id);
        if (!$orderItem) {
            return response()->json([
                'message' => 'Order item not found'
            ], 404);
        }

        $orderId = $orderItem->order_id;
        $orderItem->delete();
        
        // Update the order total amount
        $this->updateOrderTotal($orderId);
        
        return response()->json([
            'message' => 'Order item deleted successfully'
        ]);
    }
    
    /**
     * Update the total amount of an order based on its items
     *
     * @param int $orderId
     * @return void
     */
    private function updateOrderTotal($orderId)
    {
        $order = Order::with('orderItems')->find($orderId);
        if ($order) {
            $total = $order->orderItems->sum(function($item) {
                return $item->quantity * $item->unit_price;
            });
            
            $order->update(['total_amount' => $total]);
        }
    }
}
