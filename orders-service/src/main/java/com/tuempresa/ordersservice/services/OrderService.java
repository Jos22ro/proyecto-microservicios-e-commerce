package com.tuempresa.ordersservice.services;

import com.tuempresa.ordersservice.dto.request.OrderRequestDTO;
import com.tuempresa.ordersservice.dto.response.OrderResponseDTO;
import com.tuempresa.ordersservice.dto.response.OrderSummaryDTO;
import com.tuempresa.ordersservice.entities.Order;
import com.tuempresa.ordersservice.entities.OrderItem;
import com.tuempresa.ordersservice.entities.OrderStatus;
import com.tuempresa.ordersservice.exceptions.*;
import com.tuempresa.ordersservice.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for order management business logic
 * 
 * This service handles order creation, updates, and retrieval
 * with integration to external services for validation.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;
    private final AuthServiceClient authServiceClient;
    
    /**
     * Create a new order
     * 
     * @param orderRequest order creation request
     * @return created order details
     * @throws OrderCreationException if order creation fails
     */
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO orderRequest) {
        log.info("Creating order for customer: {}", orderRequest.getCustomerEmail());
        
        try {
            // Get current authenticated user
            String userId = authServiceClient.getCurrentUserId();
            
            // Validate all products exist and are available
            validateOrderItems(orderRequest.getItems());
            
            // Create order entity
            Order order = buildOrderFromRequest(orderRequest, userId);
            
            // Save order to database
            order = orderRepository.save(order);
            
            // Add items to order
            addOrderItems(order, orderRequest.getItems());
            
            // Recalculate totals
            order.recalculateTotals();
            
            // Save again with items
            order = orderRepository.save(order);
            
            log.info("Successfully created order {} for user {}", order.getId(), userId);
            
            return convertToOrderResponse(order);
            
        } catch (Exception ex) {
            log.error("Error creating order: {}", ex.getMessage(), ex);
            throw new OrderCreationException("Failed to create order: " + ex.getMessage());
        }
    }
    
    /**
     * Get order by ID for current user
     * 
     * @param orderId order ID
     * @return order details
     * @throws OrderNotFoundException if order not found
     * @throws UnauthorizedOrderAccessException if user doesn't have access
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(UUID orderId) {
        log.debug("Fetching order {} for current user", orderId);
        
        String currentUserId = authServiceClient.getCurrentUserId();
        
        return orderRepository.findById(orderId)
                .filter(order -> order.getUserId().equals(currentUserId))
                .map(this::convertToOrderResponse)
                .orElseThrow(() -> new OrderNotFoundException(
                    String.format("Order %s not found or access denied", orderId)
                ));
    }
    
    /**
     * Get orders for current user with pagination
     * 
     * @param page page number (0-based)
     * @param size page size
     * @return paginated list of orders
     */
    @Transactional(readOnly = true)
    public Page<OrderSummaryDTO> getUserOrders(int page, int size) {
        log.debug("Fetching orders page {} size {} for current user", page, size);
        
        String currentUserId = authServiceClient.getCurrentUserId();
        
        Pageable pageable = PageRequest.of(
            page, 
            size, 
            Sort.by(Sort.Direction.DESC, "createdAt")
        );
        
        Page<Order> orders = orderRepository.findByUserId(currentUserId, pageable);
        
        return orders.map(this::convertToOrderSummary);
    }
    
    /**
     * Update order status
     * 
     * @param orderId order ID
     * @param statusUpdate status update request
     * @return updated order details
     * @throws OrderNotFoundException if order not found
     * @throws InvalidOrderStatusException if status transition is invalid
     */
    @Transactional
    public OrderResponseDTO updateOrderStatus(UUID orderId, OrderRequestDTO.OrderStatusUpdateDTO statusUpdate) {
        log.info("Updating order {} status to {}", orderId, statusUpdate.getStatus());
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(
                    String.format("Order %s not found", orderId)
                ));
        
        // Validate status transition
        if (!order.getStatus().canTransitionTo(statusUpdate.getStatus())) {
            throw new InvalidOrderStatusException(
                String.format("Cannot transition from %s to %s", 
                    order.getStatus(), statusUpdate.getStatus())
            );
        }
        
        // Update status
        order.updateStatus(statusUpdate.getStatus());
        
        // Update tracking number if provided and order is being shipped
        if (statusUpdate.getTrackingNumber() != null && 
            statusUpdate.getStatus() == OrderStatus.ENVIADO) {
            order.setTrackingNumber(statusUpdate.getTrackingNumber());
        }
        
        order = orderRepository.save(order);
        
        log.info("Successfully updated order {} status to {}", orderId, statusUpdate.getStatus());
        
        return convertToOrderResponse(order);
    }
    
    /**
     * Cancel order
     * 
     * @param orderId order ID
     * @return cancelled order details
     * @throws OrderNotFoundException if order not found
     * @throws OrderCancellationException if order cannot be cancelled
     */
    @Transactional
    public OrderResponseDTO cancelOrder(UUID orderId) {
        log.info("Cancelling order {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(
                    String.format("Order %s not found", orderId)
                ));
        
        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            throw new OrderCancellationException(
                String.format("Order %s cannot be cancelled. Current status: %s", 
                    orderId, order.getStatus())
            );
        }
        
        // Update status to cancelled (this would require adding CANCELADO to enum)
        // For now, we'll log this as a limitation
        log.warn("Order cancellation not implemented for order {} with status {}", 
            orderId, order.getStatus());
        
        return convertToOrderResponse(order);
    }
    
    /**
     * Get order statistics for current user
     * 
     * @return order statistics
     */
    @Transactional(readOnly = true)
    public Object[] getUserOrderStatistics() {
        String currentUserId = authServiceClient.getCurrentUserId();
        return orderRepository.getOrderStatisticsByUserId(currentUserId);
    }
    
    /**
     * Validate order items exist and are available
     */
    private void validateOrderItems(List<OrderRequestDTO.OrderItemRequestDTO> items) {
        if (items == null || items.isEmpty()) {
            throw new OrderCreationException("Order must contain at least one item");
        }
        
        // Validate each product exists and is available
        for (OrderRequestDTO.OrderItemRequestDTO item : items) {
            try {
                Boolean productExists = productServiceClient
                    .checkProductExists(item.getProductId())
                    .block();
                
                if (productExists == null || !productExists) {
                    throw new ProductNotAvailableException(
                        String.format("Product %s is not available", item.getProductId())
                    );
                }
            } catch (Exception ex) {
                log.warn("Failed to validate product {}: {}", item.getProductId(), ex.getMessage());
                throw new ProductValidationException(
                    String.format("Unable to validate product %s", item.getProductId())
                );
            }
        }
    }
    
    /**
     * Build order entity from request DTO
     */
    private Order buildOrderFromRequest(OrderRequestDTO orderRequest, String userId) {
        return Order.builder()
                .userId(userId)
                .customerEmail(orderRequest.getCustomerEmail())
                .customerName(orderRequest.getCustomerName())
                .shippingCost(orderRequest.getShippingCost())
                .currency(orderRequest.getCurrency())
                .notes(orderRequest.getNotes())
                .shippingAddress(convertToAddress(orderRequest.getShippingAddress()))
                .billingAddress(orderRequest.getBillingAddress() != null ? 
                    convertToAddress(orderRequest.getBillingAddress()) : 
                    convertToAddress(orderRequest.getShippingAddress()))
                .build();
    }
    
    /**
     * Add order items to order
     */
    private void addOrderItems(Order order, List<OrderRequestDTO.OrderItemRequestDTO> itemRequests) {
        for (OrderRequestDTO.OrderItemRequestDTO itemRequest : itemRequests) {
            try {
                // Get product information for price and name
                var product = productServiceClient.getProductById(itemRequest.getProductId()).block();
                
                if (product == null) {
                    throw new ProductNotAvailableException(
                        String.format("Product %s not found", itemRequest.getProductId())
                    );
                }
                
                OrderItem orderItem = OrderItem.builder()
                        .productId(itemRequest.getProductId())
                        .productName(product.getName())
                        .productSku(product.getSku())
                        .quantity(itemRequest.getQuantity())
                        .unitPrice(product.getPrice())
                        .currency(product.getCurrency())
                        .build();
                
                order.addItem(orderItem);
                
            } catch (Exception ex) {
                log.error("Error adding item for product {}: {}", 
                    itemRequest.getProductId(), ex.getMessage());
                throw new ProductValidationException(
                    String.format("Failed to add product %s to order", itemRequest.getProductId())
                );
            }
        }
    }
    
    /**
     * Convert address DTO to entity
     */
    private com.tuempresa.ordersservice.entities.Address convertToAddress(
            OrderRequestDTO.AddressDTO addressDTO) {
        return com.tuempresa.ordersservice.entities.Address.builder()
                .addressLine1(addressDTO.getAddressLine1())
                .addressLine2(addressDTO.getAddressLine2())
                .city(addressDTO.getCity())
                .state(addressDTO.getState())
                .postalCode(addressDTO.getPostalCode())
                .countryCode(addressDTO.getCountryCode())
                .build();
    }
    
    /**
     * Convert order entity to response DTO
     */
    private OrderResponseDTO convertToOrderResponse(Order order) {
        var items = order.getItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());
        
        return OrderResponseDTO.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .customerInfo(OrderResponseDTO.CustomerInfoDTO.builder()
                        .name(order.getCustomerName())
                        .email(order.getCustomerEmail())
                        .build())
                .status(order.getStatus())
                .pricing(OrderResponseDTO.PricingDTO.builder()
                        .subtotal(order.getSubtotal())
                        .taxAmount(order.getTaxAmount())
                        .shippingCost(order.getShippingCost())
                        .totalAmount(order.getTotalAmount())
                        .currency(order.getCurrency())
                        .build())
                .items(items)
                .shippingInfo(OrderResponseDTO.ShippingInfoDTO.builder()
                        .address(convertAddressToDTO(order.getShippingAddress()))
                        .trackingNumber(order.getTrackingNumber())
                        .shippedAt(order.getShippedAt())
                        .build())
                .billingInfo(order.getBillingAddress() != null ? 
                    OrderResponseDTO.BillingInfoDTO.builder()
                            .address(convertAddressToDTO(order.getBillingAddress()))
                            .build() : null)
                .notes(order.getNotes())
                .paymentOrderId(order.getPaymentOrderId())
                .timestamps(OrderResponseDTO.TimestampsDTO.builder()
                        .createdAt(order.getCreatedAt())
                        .updatedAt(order.getUpdatedAt())
                        .paidAt(order.getPaidAt())
                        .shippedAt(order.getShippedAt())
                        .build())
                .build();
    }
    
    /**
     * Convert order entity to summary DTO
     */
    private OrderSummaryDTO convertToOrderSummary(Order order) {
        return OrderSummaryDTO.builder()
                .id(order.getId())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .itemCount(order.getItems().size())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .canBeCancelled(order.canBeCancelled())
                .trackingNumber(order.getTrackingNumber())
                .statusDisplayName(order.getStatus().getDescription())
                .build();
    }
    
    /**
     * Convert order item entity to response DTO
     */
    private OrderResponseDTO.OrderItemResponseDTO convertToOrderItemResponse(OrderItem item) {
        return OrderResponseDTO.OrderItemResponseDTO.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .productSku(item.getProductSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .currency(item.getCurrency())
                .build();
    }
    
    /**
     * Convert address entity to DTO
     */
    private OrderResponseDTO.AddressDTO convertAddressToDTO(
            com.tuempresa.ordersservice.entities.Address address) {
        if (address == null) return null;
        
        return OrderResponseDTO.AddressDTO.builder()
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .countryCode(address.getCountryCode())
                .build();
    }
}