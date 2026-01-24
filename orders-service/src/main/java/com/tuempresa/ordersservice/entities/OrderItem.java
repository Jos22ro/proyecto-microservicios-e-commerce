package com.tuempresa.ordersservice.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * OrderItem entity representing individual items within an order
 * 
 * This entity stores product information, pricing, and quantities
 * for each item included in an order.
 */
@Entity
@Table(name = "order_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    /**
     * The order this item belongs to
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    /**
     * External product ID from Products Service
     */
    @Column(name = "product_id", nullable = false)
    private String productId;
    
    /**
     * Product name at time of order (for historical reference)
     */
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    /**
     * Product SKU at time of order
     */
    @Column(name = "product_sku")
    private String productSku;
    
    /**
     * Quantity of this product ordered
     */
    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;
    
    /**
     * Unit price at time of order (for historical reference)
     */
    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;
    
    /**
     * Total price for this item (quantity * unit_price)
     */
    @Column(name = "total_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice;
    
    /**
     * Currency code for pricing
     */
    @Column(name = "currency", length = 3, nullable = false)
    @Builder.Default
    private String currency = "USD";
    
    /**
     * Calculate total price based on quantity and unit price
     */
    @PrePersist
    @PreUpdate
    public void calculateTotalPrice() {
        if (quantity != null && unitPrice != null) {
            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    /**
     * Update quantity and recalculate total price
     * 
     * @param newQuantity the new quantity
     */
    public void updateQuantity(Integer newQuantity) {
        if (newQuantity == null || newQuantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        this.quantity = newQuantity;
        calculateTotalPrice();
    }
    
    /**
     * Get the total price for this item
     * 
     * @return total price
     */
    public BigDecimal getTotalPrice() {
        return totalPrice != null ? totalPrice : BigDecimal.ZERO;
    }
}