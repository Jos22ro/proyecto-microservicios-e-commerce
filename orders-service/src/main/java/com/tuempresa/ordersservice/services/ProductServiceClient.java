package com.tuempresa.ordersservice.services;

import com.tuempresa.ordersservice.dto.external.ProductDTO;
import com.tuempresa.ordersservice.dto.external.UserDTO;
import com.tuempresa.ordersservice.exceptions.ServiceUnavailableException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

/**
 * Service for communicating with external Products Service
 * 
 * This service handles product retrieval and validation
 * with circuit breaker for resilience.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceClient {
    
    private final WebClient productsWebClient;
    
    public ProductServiceClient(@Qualifier("productsWebClient") WebClient productsWebClient) {
        this.productsWebClient = productsWebClient;
    }
    
    /**
     * Get product by ID
     * 
     * @param productId product ID
     * @return product information
     * @throws ServiceUnavailableException if service is unavailable
     */
    @CircuitBreaker(name = "productService", fallbackMethod = "getProductFallback")
    public Mono<ProductDTO> getProductById(String productId) {
        log.debug("Fetching product {} from Products Service", productId);
        
        return productsWebClient.get()
                .uri("/api/v1/products/{id}", productId)
                .retrieve()
                .bodyToMono(ProductDTO.class)
                .timeout(Duration.ofSeconds(5))
                .doOnSuccess(product -> log.debug("Successfully retrieved product: {}", productId))
                .doOnError(error -> log.error("Error fetching product {}: {}", productId, error.getMessage()));
    }
    
    /**
     * Get multiple products by IDs
     * 
     * @param productIds list of product IDs
     * @return list of products
     * @throws ServiceUnavailableException if service is unavailable
     */
    @CircuitBreaker(name = "productService", fallbackMethod = "getProductsFallback")
    public Mono<ProductDTO[]> getProductsByIds(String[] productIds) {
        log.debug("Fetching {} products from Products Service", productIds.length);
        
        String idsParam = String.join(",", productIds);
        
        return productsWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/products")
                        .queryParam("ids", idsParam)
                        .build())
                .retrieve()
                .bodyToMono(ProductDTO[].class)
                .timeout(Duration.ofSeconds(10))
                .doOnSuccess(products -> log.debug("Successfully retrieved {} products", products.length))
                .doOnError(error -> log.error("Error fetching products: {}", error.getMessage()));
    }
    
    /**
     * Check if product exists and is active
     * 
     * @param productId product ID
     * @return true if product exists and is active
     */
    @CircuitBreaker(name = "productService", fallbackMethod = "checkProductExistsFallback")
    public Mono<Boolean> checkProductExists(String productId) {
        log.debug("Checking if product {} exists and is active", productId);
        
        return productsWebClient.get()
                .uri("/api/v1/products/{id}/exists", productId)
                .retrieve()
                .bodyToMono(Boolean.class)
                .timeout(Duration.ofSeconds(3))
                .doOnSuccess(exists -> log.debug("Product {} exists: {}", productId, exists))
                .doOnError(error -> log.error("Error checking product existence {}: {}", productId, error.getMessage()));
    }
    
    /**
     * Get product stock information
     * 
     * @param productId product ID
     * @return stock quantity
     */
    @CircuitBreaker(name = "productService", fallbackMethod = "getProductStockFallback")
    public Mono<Integer> getProductStock(String productId) {
        log.debug("Fetching stock for product {}", productId);
        
        return productsWebClient.get()
                .uri("/api/v1/products/{id}/stock", productId)
                .retrieve()
                .bodyToMono(Integer.class)
                .timeout(Duration.ofSeconds(3))
                .doOnSuccess(stock -> log.debug("Product {} stock: {}", productId, stock))
                .doOnError(error -> log.error("Error fetching stock for product {}: {}", productId, error.getMessage()));
    }
    
    /**
     * Fallback method for getProductById
     */
    public Mono<ProductDTO> getProductFallback(String productId, Exception ex) {
        log.warn("Fallback triggered for getProductById({}): {}", productId, ex.getMessage());
        return Mono.error(new ServiceUnavailableException(
            "Products Service is currently unavailable. Please try again later."
        ));
    }
    
    /**
     * Fallback method for getProductsByIds
     */
    public Mono<ProductDTO[]> getProductsFallback(String[] productIds, Exception ex) {
        log.warn("Fallback triggered for getProductsByIds: {}", ex.getMessage());
        return Mono.error(new ServiceUnavailableException(
            "Products Service is currently unavailable. Please try again later."
        ));
    }
    
    /**
     * Fallback method for checkProductExists
     */
    public Mono<Boolean> checkProductExistsFallback(String productId, Exception ex) {
        log.warn("Fallback triggered for checkProductExists({}): {}", productId, ex.getMessage());
        return Mono.just(false); // Conservative approach: assume product doesn't exist
    }
    
    /**
     * Fallback method for getProductStock
     */
    public Mono<Integer> getProductStockFallback(String productId, Exception ex) {
        log.warn("Fallback triggered for getProductStock({}): {}", productId, ex.getMessage());
        return Mono.just(0); // Conservative approach: assume no stock
    }
    
    /**
     * Handle WebClient response exceptions
     */
    private Mono<ProductDTO> handleWebClientError(WebClientResponseException ex, String productId) {
        log.error("WebClient error for product {}: {} - {}", productId, ex.getStatusCode(), ex.getResponseBodyAsString());
        
        if (ex.getStatusCode().is4xx()) {
            return Mono.error(new ServiceUnavailableException(
                String.format("Product %s not found or is not available", productId)
            ));
        }
        
        return Mono.error(new ServiceUnavailableException(
            "Products Service temporarily unavailable"
        ));
    }
    
    /**
     * Extract error message from response body
     */
    @SuppressWarnings("unchecked")
    private String extractErrorMessage(Object responseBody) {
        if (responseBody instanceof Map) {
            Map<String, Object> errorMap = (Map<String, Object>) responseBody;
            return (String) errorMap.getOrDefault("message", "Unknown error occurred");
        }
        return responseBody.toString();
    }
}