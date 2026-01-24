package com.tuempresa.ordersservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Address entity embedded in Order for shipping and billing addresses
 * 
 * This embeddable class stores address information that can be reused
 * for both shipping and billing addresses within an order.
 */
@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    
    /**
     * Street address line 1
     */
    @Column(name = "address_line1", nullable = false)
    private String addressLine1;
    
    /**
     * Street address line 2 (optional)
     */
    @Column(name = "address_line2")
    private String addressLine2;
    
    /**
     * City name
     */
    @Column(name = "city", nullable = false)
    private String city;
    
    /**
     * State or province
     */
    @Column(name = "state", nullable = false)
    private String state;
    
    /**
     * Postal code or ZIP code
     */
    @Column(name = "postal_code", nullable = false)
    private String postalCode;
    
    /**
     * Country code (ISO 3166-1 alpha-2)
     */
    @Column(name = "country_code", length = 2, nullable = false)
    private String countryCode;
    
    /**
     * Get full formatted address
     * 
     * @return formatted address string
     */
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(addressLine1);
        
        if (addressLine2 != null && !addressLine2.trim().isEmpty()) {
            sb.append(", ").append(addressLine2);
        }
        
        sb.append(", ").append(city);
        sb.append(", ").append(state);
        sb.append(" ").append(postalCode);
        sb.append(", ").append(countryCode);
        
        return sb.toString();
    }
}