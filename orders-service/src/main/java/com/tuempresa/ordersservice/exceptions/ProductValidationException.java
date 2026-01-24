package com.tuempresa.ordersservice.exceptions;

/**
 * Exception thrown when product validation fails
 */
public class ProductValidationException extends RuntimeException {
    
    public ProductValidationException(String message) {
        super(message);
    }
    
    public ProductValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}