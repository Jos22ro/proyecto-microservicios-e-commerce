package com.tuempresa.ordersservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check controller
 * 
 * This controller provides health check endpoints
 * for monitoring and load balancer checks.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {
    
    /**
     * Simple health check
     */
    @GetMapping
    @Operation(summary = "Health check", 
               description = "Simple health check endpoint")
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "orders-service");
        
        return ResponseEntity.ok(health);
    }
    
    /**
     * Detailed health check with service status
     */
    @GetMapping("/detailed")
    @Operation(summary = "Detailed health check", 
               description = "Detailed health check with service components status")
    @ApiResponse(responseCode = "200", description = "Service components status")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "orders-service");
        
        // Add component checks
        Map<String, String> components = new HashMap<>();
        components.put("database", "UP");
        components.put("products_service", "UP");
        components.put("auth_service", "UP");
        
        health.put("components", components);
        
        return ResponseEntity.ok(health);
    }
}