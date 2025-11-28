<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; // <-- ¡Añade esta línea!

class Product extends Model{
    use HasFactory; // Ahora sabe dónde encontrarlo
    
    protected $table = 'products';

    protected $fillable = ['name', 'brand', 'description', 'price', 'sku', 'category_id'];
    
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
