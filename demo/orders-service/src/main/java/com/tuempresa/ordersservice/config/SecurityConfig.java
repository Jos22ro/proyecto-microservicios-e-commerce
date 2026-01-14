package com.tuempresa.ordersservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

/**
 * Security configuration for JWT authentication
 * 
 * This class configures Spring Security to validate JWT tokens
 * issued by the external FastAPI Auth Service.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtProperties jwtProperties;
    
    public SecurityConfig(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }
    
    /**
     * Configure security filter chain
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**", "/api/health/**", "/actuator/health").permitAll()
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );
        
        return http.build();
    }
    
    /**
     * Configure JWT decoder
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder
            .withJwkSetUri(jwtProperties.getJwksUri())
            .build();
    }
    
    /**
     * Configure JWT authentication converter
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = 
            new JwtGrantedAuthoritiesConverter(jwtProperties.getAuthoritiesClaimName());
        
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        converter.setPrincipalClaimName(jwtProperties.getPrincipalClaimName());
        
        return converter;
    }
    
    /**
     * Configuration properties for JWT
     */
    public static class JwtProperties {
        private final String jwksUri;
        private final String issuerUri;
        private final String principalClaimName;
        private final String authoritiesClaimName;
        private final List<String> audiences;
        
        public JwtProperties(
            String jwksUri,
            String issuerUri,
            String principalClaimName,
            String authoritiesClaimName,
            List<String> audiences
        ) {
            this.jwksUri = jwksUri;
            this.issuerUri = issuerUri;
            this.principalClaimName = principalClaimName;
            this.authoritiesClaimName = authoritiesClaimName;
            this.audiences = audiences;
        }
        
        public String getJwksUri() {
            return jwksUri;
        }
        
        public String getIssuerUri() {
            return issuerUri;
        }
        
        public String getPrincipalClaimName() {
            return principalClaimName;
        }
        
        public String getAuthoritiesClaimName() {
            return authoritiesClaimName;
        }
        
        public List<String> getAudiences() {
            return audiences;
        }
    }
}