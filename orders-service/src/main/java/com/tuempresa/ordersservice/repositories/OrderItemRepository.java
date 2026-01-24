package com.tuempresa.ordersservice.repositories;

import com.tuempresa.ordersservice.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for OrderItem entity
 * 
 * Provides data access methods for order items with custom queries
 * for inventory and reporting operations.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    
    /**
     * Find order items by order ID
     * 
     * @param orderId the order ID
     * @return list of order items for the order
     */
    List<OrderItem> findByOrderId(UUID orderId);
    
    /**
     * Find order items by product ID
     * 
     * @param productId the product ID
     * @return list of order items for the product
     */
    List<OrderItem> findByProductId(String productId);
    
    /**
     * Find order items by product ID across all orders
     * 
     * @param productId the product ID
     * @return list of order items for the product
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.productId = :productId")
    List<OrderItem> findAllByProductId(@Param("productId") String productId);
    
    /**
     * Count order items by product ID
     * 
     * @param productId the product ID
     * @return count of order items for the product
     */
    long countByProductId(String productId);
    
    /**
     * Get total quantity ordered for a product
     * 
     * @param productId the product ID
     * @return total quantity ordered
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.productId = :productId")
    Long getTotalQuantityOrderedByProductId(@Param("productId") String productId);
    
    /**
     * Get total revenue for a product
     * 
     * @param productId the product ID
     * @return total revenue from the product
     */
    @Query("SELECT COALESCE(SUM(oi.totalPrice), 0) FROM OrderItem oi WHERE oi.productId = :productId")
    java.math.BigDecimal getTotalRevenueByProductId(@Param("productId") String productId);
    
    /**
     * Find order items by product name (case-insensitive)
     * 
     * @param productName the product name
     * @return list of order items with matching product name
     */
    List<OrderItem> findByProductNameContainingIgnoreCase(String productName);
    
    /**
     * Get top selling products by quantity
     * 
     * @param limit the maximum number of results
     * @return list of product IDs and quantities
     */
    @Query("SELECT oi.productId, SUM(oi.quantity) as totalQuantity " +
           "FROM OrderItem oi " +
           "GROUP BY oi.productId " +
           "ORDER BY totalQuantity DESC")
    List<Object[]> findTopSellingProductsByQuantity();
    
    /**
     * Get top selling products by revenue
     * 
     * @param limit the maximum number of results
     * @return list of product IDs and revenues
     */
    @Query("SELECT oi.productId, SUM(oi.totalPrice) as totalRevenue " +
           "FROM OrderItem oi " +
           "GROUP BY oi.productId " +
           "ORDER BY totalRevenue DESC")
    List<Object[]> findTopSellingProductsByRevenue();
    
    /**
     * Find order items with quantity greater than specified value
     * 
     * @param minQuantity the minimum quantity
     * @return list of order items with quantity greater than minQuantity
     */
    List<OrderItem> findByQuantityGreaterThan(Integer minQuantity);
    
    /**
     * Find order items with total price greater than specified value
     * 
     * @param minPrice the minimum total price
     * @return list of order items with total price greater than minPrice
     */
    List<OrderItem> findByTotalPriceGreaterThan(java.math.BigDecimal minPrice);
    
    /**
     * Search order items by product name or SKU
     * 
     * @param searchTerm the search term
     * @return list of order items matching the search term
     */
    @Query("SELECT oi FROM OrderItem oi WHERE " +
           "LOWER(oi.productName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(oi.productSku) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<OrderItem> searchOrderItemsByProductInfo(@Param("searchTerm") String searchTerm);
}