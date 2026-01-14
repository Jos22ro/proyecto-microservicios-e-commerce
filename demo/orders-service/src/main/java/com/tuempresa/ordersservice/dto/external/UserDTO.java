package com.tuempresa.ordersservice.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user information from external Auth Service
 * 
 * This class represents user data retrieved from the
 * Authentication microservice for order association.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    /**
     * Unique user identifier
     */
    private String id;
    
    /**
     * Username
     */
    private String username;
    
    /**
     * User email
     */
    private String email;
    
    /**
     * User's first name
     */
    private String firstName;
    
    /**
     * User's last name
     */
    private String lastName;
    
    /**
     * User's full name (calculated)
     */
    private String fullName;
    
    /**
     * User's phone number
     */
    private String phoneNumber;
    
    /**
     * Whether user account is active
     */
    private Boolean isActive;
    
    /**
     * Whether user email is verified
     */
    private Boolean isVerified;
    
    /**
     * User's role
     */
    private String role;
    
    /**
     * User's timezone
     */
    private String timezone;
    
    /**
     * User's preferred language
     */
    private String preferredLanguage;
    
    /**
     * User's address (default shipping address)
     */
    private AddressDTO defaultAddress;
    
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