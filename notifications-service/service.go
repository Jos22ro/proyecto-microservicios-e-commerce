package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"gopkg.in/gomail.v2" // Importamos la librería para enviar correos
)

// ---------------------------------------------------------
// CONFIGURACIÓN DE GMAIL (desde variables de entorno)
// ---------------------------------------------------------
func getSMTPConfig() (host string, port int, email, password string) {
	host = os.Getenv("SMTP_HOST")
	email = os.Getenv("EMAIL_FROM")
	password = os.Getenv("EMAIL_PASSWORD")
	
	if portStr := os.Getenv("SMTP_PORT"); portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			port = p
		} else {
			port = 587 // default
		}
	} else {
		port = 587 // default
	}
	
	return
}

// ---------------------------------------------------------

// NotificationService maneja la lógica de envío
type NotificationService struct{}

func (s *NotificationService) SendNotification(req NotificationRequest) error {
	switch req.Event {

	case "order_created":
		// Esto funciona como la "Confirmación de Pedido"
		return s.sendOrderConfirmation(req)

	case "payment_confirmed":
		// NUEVO: Confirmación de Pago
		return s.sendPaymentConfirmation(req)

	case "status_changed":
		return s.sendStatusChangedEmail(req)

	default:
		return fmt.Errorf("evento no soportado: %s", req.Event)
	}
}

// 1. CONFIRMACIÓN DE PEDIDO
func (s *NotificationService) sendOrderConfirmation(req NotificationRequest) error {
	// 1. Logs para la consola (Mantenemos tu código original visual)
	log.Println("---------------------------------------------------")
	log.Printf("[EMAIL] Enviando Confirmación de Pedido a: %s", req.Email)
	log.Printf("ASUNTO: ¡Recibimos tu pedido #%d!", req.OrderID)
	log.Println("CUERPO: Hola. Hemos recibido tu solicitud de pedido.")
	log.Println("        Estamos esperando la confirmación del pago para procesarlo.")
	log.Println("---------------------------------------------------")

	// 2. Envío REAL de correo
	asunto := fmt.Sprintf("¡Recibimos tu pedido #%d!", req.OrderID)
	cuerpo := "Hola.\nHemos recibido tu solicitud de pedido.\nEstamos esperando la confirmación del pago para procesarlo."

	return s.sendEmail(req.Email, asunto, cuerpo)
}

// 2. CONFIRMACIÓN DE PAGO
func (s *NotificationService) sendPaymentConfirmation(req NotificationRequest) error {
	monto := req.ExtraData
	if monto == "" {
		monto = "Monto no especificado"
	}

	// 1. Logs para consola
	log.Println("---------------------------------------------------")
	log.Printf("[EMAIL] Enviando Comprobante de Pago a: %s", req.Email)
	log.Printf("ASUNTO: Pago Aprobado - Pedido #%d", req.OrderID)
	log.Printf("CUERPO: ¡Buenas noticias! Tu pago de %s ha sido exitoso.", monto)
	log.Println("        Prepararemos tu paquete de inmediato.")
	log.Println("---------------------------------------------------")

	// 2. Envío REAL de correo
	asunto := fmt.Sprintf("Pago Aprobado - Pedido #%d", req.OrderID)
	cuerpo := fmt.Sprintf("¡Buenas noticias!\nTu pago de %s ha sido exitoso.\nPrepararemos tu paquete de inmediato.", monto)

	return s.sendEmail(req.Email, asunto, cuerpo)
}

// 3. CAMBIO DE ESTADO
func (s *NotificationService) sendStatusChangedEmail(req NotificationRequest) error {
	// 1. Logs para consola
	log.Println("---------------------------------------------------")
	log.Printf("[EMAIL] Notificación de Estado a: %s", req.Email)
	log.Printf("ASUNTO: Actualización de Pedido #%d", req.OrderID)
	log.Printf("CUERPO: El estado de tu pedido ahora es: %s", req.ExtraData)
	log.Println("---------------------------------------------------")

	// 2. Envío REAL de correo
	asunto := fmt.Sprintf("Actualización de Pedido #%d", req.OrderID)
	cuerpo := fmt.Sprintf("El estado de tu pedido ahora es: %s", req.ExtraData)

	return s.sendEmail(req.Email, asunto, cuerpo)
}

// ---------------------------------------------------------
// FUNCIÓN AUXILIAR PRIVADA (Hace el trabajo sucio de conectar con Gmail)
// ---------------------------------------------------------
func (s *NotificationService) sendEmail(to, subject, body string) error {
	smtpHost, smtpPort, emailFrom, emailPass := getSMTPConfig()
	
	// Si las variables de entorno no están configuradas, solo avisamos en consola y no fallamos
	if emailFrom == "" {
		log.Println("[AVISO] No se envió el correo real porque faltan configurar las variables de entorno EMAIL_FROM")
		return nil
	}

	m := gomail.NewMessage()
	m.SetHeader("From", emailFrom)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	d := gomail.NewDialer(smtpHost, smtpPort, emailFrom, emailPass)

	if err := d.DialAndSend(m); err != nil {
		log.Printf("[ERROR] Falló el envío de correo real: %v", err)
		return err // Retornamos error si falla el SMTP
	}

	log.Println("[EXITO] Correo real enviado correctamente.")
	return nil
}
