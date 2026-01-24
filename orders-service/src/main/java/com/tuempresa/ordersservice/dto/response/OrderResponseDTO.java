package com.tuempresa.ordersservice.dto.response;

import com.tuempresa.ordersservice.entities.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for complete order response
 * 
 * This class represents the detailed order information
 * returned to clients for order details and management.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    
    /**
     * Unique identifier for the order
     */
    private UUID id;
    
    /**
     * User ID who created the order
     */
    private String userId;
    
    /**
     * Customer information
     */
    private CustomerInfoDTO customerInfo;
    
    /**
     * Current status of the order
     */
    private OrderStatus status;
    
    /**
     * Order pricing information
     */
    private PricingDTO pricing;
    
    /**
     * List of order items
     */
    private java.util.List<OrderItemResponseDTO> items;
    
    /**
     * Shipping information
     */
    private ShippingInfoDTO shippingInfo;
    
    /**
     * Billing information
     */
    private BillingInfoDTO billingInfo;
    
    /**
     * Order notes
     */
    private String notes;
    
    /**
     * Payment order ID (if applicable)
     */
    private String paymentOrderId;
    
    /**
     * Timestamps
     */
    private TimestampsDTO timestamps;
    
    /**
     * DTO for customer information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerInfoDTO {
        private String name;
        private String email;
    }
    
    /**
     * DTO for pricing information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingDTO {
        private BigDecimal subtotal;
        private BigDecimal taxAmount;
        private BigDecimal shippingCost;
        private BigDecimal totalAmount;
        private String currency;
    }
    
    /**
     * DTO for shipping information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingInfoDTO {
        private AddressDTO address;
        private String trackingNumber;
        private LocalDateTime shippedAt;
    }
    
    /**
     * DTO for billing information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillingInfoDTO {
        private AddressDTO address;
    }
    
    /**
     * DTO for timestamps
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimestampsDTO {
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime paidAt;
        private LocalDateTime shippedAt;
    }
    
    /**
     * DTO for address information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String postalCode;
        private String countryCode;
    }
}