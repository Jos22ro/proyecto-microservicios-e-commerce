package com.tuempresa.ordersservice.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for product information from external Products Service
 * 
 * This class represents product data retrieved from the
 * Products microservice for order validation and pricing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    
    /**
     * Unique product identifier
     */
    private String id;
    
    /**
     * Product name
     */
    private String name;
    
    /**
     * Product SKU (Stock Keeping Unit)
     */
    private String sku;
    
    /**
     * Current product price
     */
    private BigDecimal price;
    
    /**
     * Currency code for price
     */
    private String currency;
    
    /**
     * Product description
     */
    private String description;
    
    /**
     * Whether product is currently active
     */
    private Boolean isActive;
    
    /**
     * Current stock quantity
     */
    private Integer stockQuantity;
    
    /**
     * Product category
     */
    private String category;
    
    /**
     * Product weight (for shipping calculations)
     */
    private BigDecimal weight;
    
    /**
     * Product dimensions
     */
    private DimensionsDTO dimensions;
    
    /**
     * DTO for product dimensions
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DimensionsDTO {
        
        /**
         * Length in centimeters
         */
        private BigDecimal length;
        
        /**
         * Width in centimeters
         */
        private BigDecimal width;
        
        /**
         * Height in centimeters
         */
        private BigDecimal height;
    }
}