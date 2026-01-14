package com.tuempresa.ordersservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for individual order item in response
 * 
 * This class represents order item information
 * returned as part of order details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDTO {
    
    /**
     * Unique identifier for order item
     */
    private UUID id;
    
    /**
     * Product ID
     */
    private String productId;
    
    /**
     * Product name at time of order
     */
    private String productName;
    
    /**
     * Product SKU at time of order
     */
    private String productSku;
    
    /**
     * Quantity ordered
     */
    private Integer quantity;
    
    /**
     * Unit price at time of order
     */
    private BigDecimal unitPrice;
    
    /**
     * Total price for this item
     */
    private BigDecimal totalPrice;
    
    /**
     * Currency code
     */
    private String currency;
}