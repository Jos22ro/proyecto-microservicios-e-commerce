package com.tuempresa.ordersservice.exceptions;

/**
 * Exception thrown when user attempts to access an order they don't own
 */
public class UnauthorizedOrderAccessException extends RuntimeException {
    
    public UnauthorizedOrderAccessException(String message) {
        super(message);
    }
    
    public UnauthorizedOrderAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}