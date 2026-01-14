package com.tuempresa.ordersservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

/**
 * JPA configuration for auditing
 * 
 * This class configures JPA auditing functionality
 * to track entity creation and modification information.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaConfig {
    
    /**
     * Provider for audit information
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return new AuditorAwareImpl();
    }
    
    /**
     * Implementation of AuditorAware
     */
    public static class AuditorAwareImpl implements AuditorAware<String> {
        
        @Override
        public Optional<String> getCurrentAuditor() {
            // In a real microservice, this would extract user ID from security context
            // For now, we'll return "system" as a placeholder
            return Optional.of("system");
        }
    }
}