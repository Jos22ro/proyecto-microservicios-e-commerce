package com.tuempresa.ordersservice.exceptions;

/**
 * Exception thrown when order cancellation fails
 */
public class OrderCancellationException extends RuntimeException {
    
    public OrderCancellationException(String message) {
        super(message);
    }
    
    public OrderCancellationException(String message, Throwable cause) {
        super(message, cause);
    }
}