package com.tuempresa.ordersservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de CORS para el Orders Service.
 * Permite solicitudes desde el frontend durante desarrollo y producción.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",  // Frontend en desarrollo
                    "http://localhost:8080",  // Alternativo frontend
                    "http://127.0.0.1:3000",  // Alternativo desarrollo
                    "https://localhost:3000", // HTTPS development
                    "http://frontend:3000",   // Docker networking
                    "http://your-domain.com", // Producción - reemplazar con dominio real
                    "https://your-domain.com" // HTTPS producción - reemplazar
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("Authorization", "Content-Type", "Accept", "Origin", 
                               "X-Requested-With", "Access-Control-Request-Method", 
                               "Access-Control-Request-Headers")
                .exposedHeaders("Access-Control-Allow-Origin", "Access-Control-Allow-Credentials")
                .allowCredentials(true)
                .maxAge(3600); // Cache preflight por 1 hora
    }
}