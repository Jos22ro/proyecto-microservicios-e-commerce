package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	Service *NotificationService
}

func (h *NotificationHandler) SendNotification(c *gin.Context) {
	// Log incoming request for debugging
	fmt.Printf("📨 Received notification request from %s\n", c.Request.Header.Get("Origin"))
	
	var req NotificationRequest

	// Validar el JSON de entrada
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON validation error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Llamar a la lógica de negocio
	if err := h.Service.SendNotification(req); err != nil {
		fmt.Printf("❌ Failed to send notification: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo enviar la notificación"})
		return
	}

	fmt.Printf("✅ Notification sent successfully for event: %s, order: %d, email: %s\n", req.Event, req.OrderID, req.Email)
	c.JSON(http.StatusOK, gin.H{"message": "Notificación enviada correctamente"})
}
