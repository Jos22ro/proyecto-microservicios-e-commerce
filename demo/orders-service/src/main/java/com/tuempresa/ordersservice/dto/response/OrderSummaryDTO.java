package com.tuempresa.ordersservice.dto.response;

import com.tuempresa.ordersservice.entities.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for order summary response
 * 
 * This class represents summarized order information
 * returned for listing operations where full details are not needed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryDTO {
    
    /**
     * Unique identifier for order
     */
    private UUID id;
    
    /**
     * Customer name
     */
    private String customerName;
    
    /**
     * Customer email
     */
    private String customerEmail;
    
    /**
     * Current status of order
     */
    private OrderStatus status;
    
    /**
     * Total amount of order
     */
    private BigDecimal totalAmount;
    
    /**
     * Currency code
     */
    private String currency;
    
    /**
     * Number of items in order
     */
    private Integer itemCount;
    
    /**
     * Date when order was created
     */
    private LocalDateTime createdAt;
    
    /**
     * Date when order was last updated
     */
    private LocalDateTime updatedAt;
    
    /**
     * Whether order can be cancelled
     */
    private Boolean canBeCancelled;
    
    /**
     * Tracking number (if shipped)
     */
    private String trackingNumber;
    
    /**
     * Order status display name
     */
    private String statusDisplayName;
}