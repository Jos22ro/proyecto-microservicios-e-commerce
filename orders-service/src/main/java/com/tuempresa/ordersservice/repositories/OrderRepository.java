package com.tuempresa.ordersservice.repositories;

import com.tuempresa.ordersservice.entities.Order;
import com.tuempresa.ordersservice.entities.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Order entity
 * 
 * Provides data access methods for orders with custom queries
 * for common business operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    /**
     * Find orders by user ID with pagination
     * 
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of orders for the user
     */
    Page<Order> findByUserId(String userId, Pageable pageable);
    
    /**
     * Find orders by user ID and status
     * 
     * @param userId the user ID
     * @param status the order status
     * @param pageable pagination information
     * @return page of orders for the user with specified status
     */
    Page<Order> findByUserIdAndStatus(String userId, OrderStatus status, Pageable pageable);
    
    /**
     * Find orders by status
     * 
     * @param status the order status
     * @param pageable pagination information
     * @return page of orders with specified status
     */
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    /**
     * Find orders by customer email
     * 
     * @param customerEmail the customer email
     * @param pageable pagination information
     * @return page of orders for the customer email
     */
    Page<Order> findByCustomerEmail(String customerEmail, Pageable pageable);
    
    /**
     * Find orders created within a date range
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable pagination information
     * @return page of orders created within the date range
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Page<Order> findByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
    
    /**
     * Find orders by user ID created within a date range
     * 
     * @param userId the user ID
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable pagination information
     * @return page of orders for the user created within the date range
     */
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.createdAt BETWEEN :startDate AND :endDate")
    Page<Order> findByUserIdAndCreatedAtBetween(
        @Param("userId") String userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
    
    /**
     * Find orders with total amount greater than specified value
     * 
     * @param minAmount the minimum amount
     * @param pageable pagination information
     * @return page of orders with total amount greater than minAmount
     */
    Page<Order> findByTotalAmountGreaterThan(BigDecimal minAmount, Pageable pageable);
    
    /**
     * Find orders by payment order ID
     * 
     * @param paymentOrderId the payment order ID
     * @return optional order with the payment order ID
     */
    Optional<Order> findByPaymentOrderId(String paymentOrderId);
    
    /**
     * Find orders by tracking number
     * 
     * @param trackingNumber the tracking number
     * @return optional order with the tracking number
     */
    Optional<Order> findByTrackingNumber(String trackingNumber);
    
    /**
     * Count orders by user ID and status
     * 
     * @param userId the user ID
     * @param status the order status
     * @return count of orders for the user with specified status
     */
    long countByUserIdAndStatus(String userId, OrderStatus status);
    
    /**
     * Count orders by status
     * 
     * @param status the order status
     * @return count of orders with specified status
     */
    long countByStatus(OrderStatus status);
    
    /**
     * Find orders that need to be processed (created but not paid)
     * 
     * @param pageable pagination information
     * @return page of orders that need processing
     */
    @Query("SELECT o FROM Order o WHERE o.status = 'CREADO' ORDER BY o.createdAt ASC")
    Page<Order> findOrdersNeedingProcessing(Pageable pageable);
    
    /**
     * Find orders that are ready to be shipped (paid but not shipped)
     * 
     * @param pageable pagination information
     * @return page of orders ready to ship
     */
    @Query("SELECT o FROM Order o WHERE o.status = 'PAGADO' ORDER BY o.paidAt ASC")
    Page<Order> findOrdersReadyToShip(Pageable pageable);
    
    /**
     * Get order statistics by user ID
     * 
     * @param userId the user ID
     * @return array with [total_orders, total_amount, last_order_date]
     */
    @Query("SELECT COUNT(o), COALESCE(SUM(o.totalAmount), 0), MAX(o.createdAt) " +
           "FROM Order o WHERE o.userId = :userId")
    Object[] getOrderStatisticsByUserId(@Param("userId") String userId);
    
    /**
     * Search orders by customer name or email
     * 
     * @param searchTerm the search term
     * @param pageable pagination information
     * @return page of orders matching the search term
     */
    @Query("SELECT o FROM Order o WHERE " +
           "LOWER(o.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Order> searchOrdersByCustomerInfo(@Param("searchTerm") String searchTerm, Pageable pageable);
}