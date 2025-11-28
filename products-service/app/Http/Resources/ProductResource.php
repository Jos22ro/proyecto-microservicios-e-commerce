<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CategoryResource;

class ProductResource extends JsonResource
{
    /**
     * Transforma el recurso a un array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Campos directos del Modelo Product
            'id' => $this->id,
            'nombre' => $this->name,
            'marca' => $this->brand,
            'descripcion' => $this->description,
            'precio' => $this->price,
            'sku' => $this->sku,

            // Transformación de la Relación (Category)
            'categoria' => new CategoryResource($this->whenLoaded('category')),

            // Metadatos y Auditoría (opcional)
            'creado_en' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
