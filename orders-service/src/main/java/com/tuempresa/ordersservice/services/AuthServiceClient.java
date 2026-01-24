package com.tuempresa.ordersservice.services;

import com.tuempresa.ordersservice.dto.external.UserDTO;
import com.tuempresa.ordersservice.exceptions.ServiceUnavailableException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Service for communicating with external Auth Service
 * 
 * This service handles user information retrieval
 * with circuit breaker for resilience.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceClient {
    
    private final WebClient authWebClient;
    
    public AuthServiceClient(@Qualifier("authWebClient") WebClient authWebClient) {
        this.authWebClient = authWebClient;
    }
    
    /**
     * Get user by ID
     * 
     * @param userId user ID
     * @return user information
     * @throws ServiceUnavailableException if service is unavailable
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "getUserByIdFallback")
    public Mono<UserDTO> getUserById(String userId) {
        log.debug("Fetching user {} from Auth Service", userId);
        
        return authWebClient.get()
                .uri("/api/v1/users/{id}", userId)
                .retrieve()
                .bodyToMono(UserDTO.class)
                .timeout(Duration.ofSeconds(5))
                .doOnSuccess(user -> log.debug("Successfully retrieved user: {}", userId))
                .doOnError(error -> log.error("Error fetching user {}: {}", userId, error.getMessage()));
    }
    
    /**
     * Get current authenticated user information
     * 
     * @return current user information
     */
    public Mono<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Mono.error(new ServiceUnavailableException(
                "No authenticated user found in security context"
            ));
        }
        
        String userId = authentication.getName();
        if (userId == null || userId.trim().isEmpty()) {
            return Mono.error(new ServiceUnavailableException(
                "User ID not found in authentication token"
            ));
        }
        
        return getUserById(userId);
    }
    
    /**
     * Validate user exists and is active
     * 
     * @param userId user ID
     * @return true if user exists and is active
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "validateUserFallback")
    public Mono<Boolean> validateUser(String userId) {
        log.debug("Validating user {} with Auth Service", userId);
        
        return authWebClient.get()
                .uri("/api/v1/users/{id}/validate", userId)
                .retrieve()
                .bodyToMono(Boolean.class)
                .timeout(Duration.ofSeconds(3))
                .doOnSuccess(valid -> log.debug("User {} validation result: {}", userId, valid))
                .doOnError(error -> log.error("Error validating user {}: {}", userId, error.getMessage()));
    }
    
    /**
     * Get user preferences
     * 
     * @param userId user ID
     * @return user preferences
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "getUserPreferencesFallback")
    public Mono<Object> getUserPreferences(String userId) {
        log.debug("Fetching preferences for user {}", userId);
        
        return authWebClient.get()
                .uri("/api/v1/users/{id}/preferences", userId)
                .retrieve()
                .bodyToMono(Object.class)
                .timeout(Duration.ofSeconds(3))
                .doOnSuccess(prefs -> log.debug("Successfully retrieved preferences for user: {}", userId))
                .doOnError(error -> log.error("Error fetching preferences for user {}: {}", userId, error.getMessage()));
    }
    
    /**
     * Fallback method for getUserById
     */
    public Mono<UserDTO> getUserByIdFallback(String userId, Exception ex) {
        log.warn("Fallback triggered for getUserById({}): {}", userId, ex.getMessage());
        return Mono.error(new ServiceUnavailableException(
            "Auth Service is currently unavailable. Please try again later."
        ));
    }
    
    /**
     * Fallback method for validateUser
     */
    public Mono<Boolean> validateUserFallback(String userId, Exception ex) {
        log.warn("Fallback triggered for validateUser({}): {}", userId, ex.getMessage());
        return Mono.just(false); // Conservative approach: assume user is invalid
    }
    
    /**
     * Fallback method for getUserPreferences
     */
    public Mono<Object> getUserPreferencesFallback(String userId, Exception ex) {
        log.warn("Fallback triggered for getUserPreferences({}): {}", userId, ex.getMessage());
        return Mono.just(Object()); // Return empty object as fallback
    }
    
    /**
     * Get current user ID from security context
     * 
     * @return current user ID
     * @throws IllegalStateException if no authenticated user found
     */
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found in security context");
        }
        
        String userId = authentication.getName();
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalStateException("User ID not found in authentication token");
        }
        
        return userId;
    }
}