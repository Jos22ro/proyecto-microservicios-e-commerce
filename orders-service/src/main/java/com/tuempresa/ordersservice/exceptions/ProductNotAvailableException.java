package com.tuempresa.ordersservice.exceptions;

/**
 * Exception thrown when a product is not available
 */
public class ProductNotAvailableException extends RuntimeException {
    
    public ProductNotAvailableException(String message) {
        super(message);
    }
    
    public ProductNotAvailableException(String message, Throwable cause) {
        super(message, cause);
    }
}