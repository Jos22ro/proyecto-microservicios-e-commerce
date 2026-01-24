package com.tuempresa.ordersservice.entities;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enum representing the possible states of an Order
 * 
 * This enum defines the lifecycle of an order with controlled
 * state transitions to ensure business logic consistency.
 */
@Getter
@RequiredArgsConstructor
public enum OrderStatus {
    
    /**
     * Order has been created but not yet paid
     */
    CREADO("CREADO", "Order created and awaiting payment"),
    
    /**
     * Order has been paid and is being processed
     */
    PAGADO("PAGADO", "Order paid and being processed"),
    
    /**
     * Order has been shipped to customer
     */
    ENVIADO("ENVIADO", "Order shipped to customer");
    
    private final String code;
    private final String description;
    
    /**
     * Check if a transition from current status to new status is valid
     * 
     * @param newStatus the target status
     * @return true if transition is valid, false otherwise
     */
    public boolean canTransitionTo(OrderStatus newStatus) {
        return switch (this) {
            case CREADO -> newStatus == PAGADO;
            case PAGADO -> newStatus == ENVIADO;
            case ENVIADO -> false; // Final state
        };
    }
    
    /**
     * Get the next possible status in the order lifecycle
     * 
     * @return the next status or null if this is a final state
     */
    public OrderStatus getNextStatus() {
        return switch (this) {
            case CREADO -> PAGADO;
            case PAGADO -> ENVIADO;
            case ENVIADO -> null; // Final state
        };
    }
    
    /**
     * Find OrderStatus by code
     * 
     * @param code the status code
     * @return the corresponding OrderStatus
     * @throws IllegalArgumentException if code is not found
     */
    public static OrderStatus fromCode(String code) {
        for (OrderStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid OrderStatus code: " + code);
    }
}