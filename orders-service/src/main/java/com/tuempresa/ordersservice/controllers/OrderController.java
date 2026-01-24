package com.tuempresa.ordersservice.controllers;

import com.tuempresa.ordersservice.dto.request.OrderRequestDTO;
import com.tuempresa.ordersservice.dto.request.OrderRequestDTO.OrderStatusUpdateDTO;
import com.tuempresa.ordersservice.dto.response.OrderResponseDTO;
import com.tuempresa.ordersservice.dto.response.OrderSummaryDTO;
import com.tuempresa.ordersservice.services.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for order management
 * 
 * This controller provides endpoints for creating, retrieving,
 * updating, and managing orders with JWT authentication.
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
public class OrderController {
    
    private final OrderService orderService;
    
    /**
     * Create a new order
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create order", 
               description = "Create a new order with the provided items and shipping information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Order created successfully",
                   content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid order data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<OrderResponseDTO> createOrder(
            @Valid @RequestBody OrderRequestDTO orderRequest) {
        log.info("Creating new order for customer: {}", orderRequest.getCustomerEmail());
        
        try {
            OrderResponseDTO createdOrder = orderService.createOrder(orderRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (Exception ex) {
            log.error("Error creating order: {}", ex.getMessage(), ex);
            throw ex; // Will be handled by global exception handler
        }
    }
    
    /**
     * Get all orders for the authenticated user
     */
    @GetMapping
    @Operation(summary = "Get user orders", 
               description = "Retrieve all orders for the authenticated user with pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Page<OrderSummaryDTO>> getUserOrders(
            @Parameter(description = "Page number (0-based)") 
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Page size") 
            @RequestParam(defaultValue = "20") int size,
            
            @Parameter(description = "Sort field") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Sort direction") 
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.debug("Fetching orders page {} size {} for user", page, size);
        
        try {
            Page<OrderSummaryDTO> orders = orderService.getUserOrders(page, size);
            return ResponseEntity.ok(orders);
        } catch (Exception ex) {
            log.error("Error fetching user orders: {}", ex.getMessage(), ex);
            throw ex;
        }
    }
    
    /**
     * Get order by ID
     */
    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID", 
               description = "Retrieve detailed information about a specific order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully",
                   content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @Parameter(description = "Order ID") 
            @PathVariable UUID orderId) {
        
        log.debug("Fetching order details for: {}", orderId);
        
        try {
            OrderResponseDTO order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception ex) {
            log.error("Error fetching order {}: {}", orderId, ex.getMessage(), ex);
            throw ex;
        }
    }
    
    /**
     * Update order status
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Update order status", 
               description = "Update the status of an order (Admin/Staff only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order status updated successfully",
                   content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid status transition"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin/Staff only"),
        @ApiResponse(responseCode = "404", description = "Order not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @Parameter(description = "Order ID") 
            @PathVariable UUID orderId,
            
            @Valid @RequestBody OrderStatusUpdateDTO statusUpdate) {
        
        log.info("Updating order {} status to {}", orderId, statusUpdate.getStatus());
        
        try {
            OrderResponseDTO updatedOrder = orderService.updateOrderStatus(orderId, statusUpdate);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception ex) {
            log.error("Error updating order {} status: {}", orderId, ex.getMessage(), ex);
            throw ex;
        }
    }
    
    /**
     * Cancel order
     */
    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order", 
               description = "Cancel an order (only if it's in CREADO status)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully",
                   content = @Content(schema = @Schema(implementation = OrderResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<OrderResponseDTO> cancelOrder(
            @Parameter(description = "Order ID") 
            @PathVariable UUID orderId) {
        
        log.info("Cancelling order: {}", orderId);
        
        try {
            OrderResponseDTO cancelledOrder = orderService.cancelOrder(orderId);
            return ResponseEntity.ok(cancelledOrder);
        } catch (Exception ex) {
            log.error("Error cancelling order {}: {}", orderId, ex.getMessage(), ex);
            throw ex;
        }
    }
    
    /**
     * Get order statistics for the authenticated user
     */
    @GetMapping("/statistics")
    @Operation(summary = "Get order statistics", 
               description = "Retrieve order statistics for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Object[]> getOrderStatistics() {
        log.debug("Fetching order statistics for user");
        
        try {
            Object[] statistics = orderService.getUserOrderStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception ex) {
            log.error("Error fetching order statistics: {}", ex.getMessage(), ex);
            throw ex;
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    @Operation(summary = "Health check", 
               description = "Check if the orders service is healthy")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service is healthy")
    })
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Orders Service is healthy");
    }
}