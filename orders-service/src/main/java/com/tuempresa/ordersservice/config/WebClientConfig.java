package com.tuempresa.ordersservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * Configuration for external service clients
 * 
 * This class configures WebClient instances for communicating
 * with external microservices.
 */
@Configuration
public class WebClientConfig {
    
    @Value("${services.products.url:http://product-service:8000}")
    private String productsServiceUrl;
    
    @Value("${services.inventory.url:http://inventory-service:8080}")
    private String inventoryServiceUrl;
    
    @Value("${services.auth.url:http://auth-service:8000}")
    private String authServiceUrl;
    
    @Value("${services.timeout:5000}")
    private int defaultTimeout;
    
    /**
     * WebClient for Products Service
     */
    @Bean("productsWebClient")
    public WebClient productsWebClient() {
        return WebClient.builder()
            .baseUrl(productsServiceUrl)
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
    }
    
    /**
     * WebClient for Inventory Service
     */
    @Bean("inventoryWebClient")
    public WebClient inventoryWebClient() {
        return WebClient.builder()
            .baseUrl(inventoryServiceUrl)
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
    }
    
    /**
     * WebClient for Auth Service
     */
    @Bean("authWebClient")
    public WebClient authWebClient() {
        return WebClient.builder()
            .baseUrl(authServiceUrl)
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
    }
    
    /**
     * Timeout configuration for WebClient
     */
    @Bean
    public Duration webClientTimeout() {
        return Duration.ofMillis(defaultTimeout);
    }
}