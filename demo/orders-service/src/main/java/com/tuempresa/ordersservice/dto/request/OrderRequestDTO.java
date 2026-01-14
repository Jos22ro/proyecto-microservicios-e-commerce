package com.tuempresa.ordersservice.dto.request;

import com.tuempresa.ordersservice.entities.Address;
import com.tuempresa.ordersservice.dto.external.ProductDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating a new order
 * 
 * This class represents the request payload for creating
 * orders with validation and business rules.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {
    
    /**
     * Customer name for the order
     */
    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    private String customerName;
    
    /**
     * Customer email for notifications
     */
    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String customerEmail;
    
    /**
     * List of items to include in the order
     */
    @Valid
    @NotEmpty(message = "Order must contain at least one item")
    @Size(min = 1, max = 50, message = "Order can contain between 1 and 50 items")
    private List<OrderItemRequestDTO> items;
    
    /**
     * Shipping address for the order
     */
    @Valid
    @NotNull(message = "Shipping address is required")
    private AddressDTO shippingAddress;
    
    /**
     * Billing address (optional, defaults to shipping address if not provided)
     */
    @Valid
    private AddressDTO billingAddress;
    
    /**
     * Shipping cost for the order
     */
    @NotNull(message = "Shipping cost is required")
    @DecimalMin(value = "0.00", message = "Shipping cost must be non-negative")
    @Digits(integer = 8, fraction = 2, message = "Shipping cost must have maximum 8 integer digits and 2 decimal places")
    private BigDecimal shippingCost;
    
    /**
     * Currency code for the order
     */
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency code must be 3 uppercase letters")
    @Builder.Default
    private String currency = "USD";
    
    /**
     * Order notes or special instructions
     */
    @Size(max = 1000, message = "Order notes must not exceed 1000 characters")
    private String notes;
    
    /**
     * DTO for individual order items
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequestDTO {
        
        /**
         * External product ID from Products Service
         */
        @NotBlank(message = "Product ID is required")
        @Size(min = 1, max = 100, message = "Product ID must be between 1 and 100 characters")
        private String productId;
        
        /**
         * Quantity of the product
         */
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 100, message = "Quantity cannot exceed 100")
        private Integer quantity;
    }
    
    /**
     * DTO for address information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {
        
        /**
         * Street address line 1
         */
        @NotBlank(message = "Address line 1 is required")
        @Size(min = 5, max = 200, message = "Address line 1 must be between 5 and 200 characters")
        private String addressLine1;
        
        /**
         * Street address line 2 (optional)
         */
        @Size(max = 200, message = "Address line 2 must not exceed 200 characters")
        private String addressLine2;
        
        /**
         * City name
         */
        @NotBlank(message = "City is required")
        @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
        private String city;
        
        /**
         * State or province
         */
        @NotBlank(message = "State is required")
        @Size(min = 2, max = 100, message = "State must be between 2 and 100 characters")
        private String state;
        
        /**
         * Postal code or ZIP code
         */
        @NotBlank(message = "Postal code is required")
        @Size(min = 3, max = 20, message = "Postal code must be between 3 and 20 characters")
        private String postalCode;
        
        /**
         * Country code (ISO 3166-1 alpha-2)
         */
        @NotBlank(message = "Country code is required")
        @Pattern(regexp = "^[A-Z]{2}$", message = "Country code must be 2 uppercase letters")
        private String countryCode;
    }
}