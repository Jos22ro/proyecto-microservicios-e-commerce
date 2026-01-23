package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	Service *NotificationService
}

func (h *NotificationHandler) SendNotification(c *gin.Context) {
	var req NotificationRequest

	// Validar el JSON de entrada
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Llamar a la lógica de negocio
	if err := h.Service.SendNotification(req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo enviar la notificación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notificación enviada correctamente"})
}