package main

import (
	"net/http"
	"os"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Configurar CORS - debe estar antes de las rutas
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Header("Access-Control-Expose-Headers", "Content-Length")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Inyección de dependencias simple
	svc := &NotificationService{}
	handler := &NotificationHandler{Service: svc}

	// Definir rutas
	v1 := r.Group("/api/v1")
	{
		v1.POST("/notify", handler.SendNotification)
	}

	// Correr en el puerto desde variable de entorno o 8082 por defecto
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	
	fmt.Printf("🚀 Notifications Service running on port %s\n", port)
	fmt.Printf("📧 Health check: http://localhost:%s/api/v1/notify\n", port)
	
	r.Run(":" + port)
}
