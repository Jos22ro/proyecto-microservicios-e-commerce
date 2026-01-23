package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Inyección de dependencias simple
	svc := &NotificationService{}
	handler := &NotificationHandler{Service: svc}

	// Definir rutas
	v1 := r.Group("/api/v1")
	{
		v1.POST("/notify", handler.SendNotification)
	}

	// Correr en el puerto 8082 (para no chocar con el de pedidos que suele ser 8080)
	r.Run(":8082")
}
