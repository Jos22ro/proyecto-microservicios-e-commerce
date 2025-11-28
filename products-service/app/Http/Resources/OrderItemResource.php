<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\ProductResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id ?? null,
            'producto' => new ProductResource($this->whenLoaded('product')),
            'cantidad' => $this->quantity ?? $this->qty ?? null,
            'precio' => $this->price ?? null,
            'subtotal' => $this->subtotal ?? (($this->price ?? 0) * ($this->quantity ?? ($this->qty ?? 0))),
        ];
    }
}