<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\OrderItemResource;

class OrderResource extends JsonResource
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
            'user_id' => $this->user_id ?? null,
            'estado' => $this->status ?? $this->state ?? null,
            'total' => $this->total ?? $this->amount ?? null,
            'items' => $this->whenLoaded('orderItems', function () {
                return OrderItemResource::collection($this->orderItems);
            }),
            // soporte alternativo si la relación se llama 'items'
            'items_alt' => $this->whenLoaded('items', function () {
                return OrderItemResource::collection($this->items);
            }),
            'creado_en' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
        ];
    }
}