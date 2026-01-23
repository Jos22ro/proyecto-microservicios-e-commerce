package main

// NotificationRequest representa la estructura del JSON que recibirás
type NotificationRequest struct {
	Event     string `json:"event" binding:"required"`       // "order_created" o "status_changed"
	Email     string `json:"email" binding:"required,email"` // Destinatario
	OrderID   uint   `json:"order_id" binding:"required"`
	ExtraData string `json:"extra_data"` // E.g., nuevo estado "SHIPPED"
}