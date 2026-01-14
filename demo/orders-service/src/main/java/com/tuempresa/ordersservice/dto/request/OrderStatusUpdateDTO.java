package com.tuempresa.ordersservice.dto.request;

import com.tuempresa.ordersservice.entities.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating order status
 * 
 * This class represents the request payload for updating
 * the status of an existing order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateDTO {
    
    /**
     * New status for the order
     */
    @NotNull(message = "Status is required")
    private OrderStatus status;
    
    /**
     * Optional notes about the status change
     */
    @NotBlank(message = "Notes cannot be blank if provided")
    private String notes;
    
    /**
     * Optional tracking number for shipped orders
     */
    private String trackingNumber;
}