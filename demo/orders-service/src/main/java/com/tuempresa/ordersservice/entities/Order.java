package com.tuempresa.ordersservice.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Order entity representing a customer order in the system
 * 
 * This entity stores order information including customer details,
 * items, pricing, and status tracking with audit information.
 */
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    /**
     * External user ID from Auth Service
     */
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    /**
     * Customer email for order notifications
     */
    @Column(name = "customer_email", nullable = false)
    private String customerEmail;
    
    /**
     * Customer name for order reference
     */
    @Column(name = "customer_name", nullable = false)
    private String customerName;
    
    /**
     * Current status of the order
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.CREADO;
    
    /**
     * Subtotal amount (sum of item prices before tax)
     */
    @Column(name = "subtotal", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    /**
     * Tax amount
     */
    @Column(name = "tax_amount", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    /**
     * Shipping cost
     */
    @Column(name = "shipping_cost", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;
    
    /**
     * Total order amount (subtotal + tax + shipping)
     */
    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    /**
     * Currency code for pricing (e.g., USD, EUR)
     */
    @Column(name = "currency", length = 3, nullable = false)
    @Builder.Default
    private String currency = "USD";
    
    /**
     * Shipping address
     */
    @Embedded
    private Address shippingAddress;
    
    /**
     * Billing address (optional, defaults to shipping address)
     */
    @Embedded
    private Address billingAddress;
    
    /**
     * Order items collection
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    
    /**
     * Order notes or special instructions
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    /**
     * External order ID from payment gateway
     */
    @Column(name = "payment_order_id")
    private String paymentOrderId;
    
    /**
     * Tracking number for shipped orders
     */
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    /**
     * Version for optimistic locking
     */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;
    
    /**
     * Timestamp when order was created
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * Timestamp when order was last updated
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * Timestamp when order was paid
     */
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
    /**
     * Timestamp when order was shipped
     */
    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;
    
    /**
     * Add an item to the order
     * 
     * @param item the order item to add
     */
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        recalculateTotals();
    }
    
    /**
     * Remove an item from the order
     * 
     * @param item the order item to remove
     */
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
        recalculateTotals();
    }
    
    /**
     * Update order status with validation
     * 
     * @param newStatus the new status
     * @throws IllegalStateException if transition is invalid
     */
    public void updateStatus(OrderStatus newStatus) {
        if (!status.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                String.format("Cannot transition from %s to %s", status, newStatus)
            );
        }
        
        this.status = newStatus;
        
        // Update timestamps based on status
        switch (newStatus) {
            case PAGADO -> this.paidAt = LocalDateTime.now();
            case ENVIADO -> this.shippedAt = LocalDateTime.now();
        }
    }
    
    /**
     * Recalculate order totals based on items
     */
    public void recalculateTotals() {
        this.subtotal = items.stream()
            .map(OrderItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate tax (assuming 10% tax rate - could be configurable)
        this.taxAmount = subtotal.multiply(new BigDecimal("0.10"));
        
        // Calculate total
        this.totalAmount = subtotal.add(taxAmount).add(shippingCost);
    }
    
    /**
     * Check if order can be cancelled
     * 
     * @return true if order can be cancelled
     */
    public boolean canBeCancelled() {
        return status == OrderStatus.CREADO;
    }
    
    /**
     * Check if order is paid
     * 
     * @return true if order is paid
     */
    public boolean isPaid() {
        return status == OrderStatus.PAGADO || status == OrderStatus.ENVIADO;
    }
    
    /**
     * Check if order is shipped
     * 
     * @return true if order is shipped
     */
    public boolean isShipped() {
        return status == OrderStatus.ENVIADO;
    }
}