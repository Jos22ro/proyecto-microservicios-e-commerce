# Multi-stage build for optimal size and caching
FROM eclipse-temurin:17-jdk-alpine AS build

# Labels for metadata
LABEL maintainer="your-company" \
      version="1.0.0" \
      description="Orders Service - Java Spring Boot microservice for order management" \
      org.opencontainers.image.source="https://github.com/yourcompany/orders-service"

# Set build arguments
ARG BUILD_PROFILE=prod
ARG JAR_FILE=orders-service-1.0.0.jar

# Install dependencies and build the application
WORKDIR /build

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Download Maven dependencies and build the application
RUN --mount=type=cache,target=/root/.m2 ./mvn -B -DskipTests -Dspring.profiles.active=${BUILD_PROFILE} clean package

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Create application user
RUN addgroup -g 1001 ordersgroup && \
    adduser -u 1001 -G ordersgroup -s /bin/sh -D ordersuser

# Set working directory
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /build/target/*.jar app.jar

# Change ownership to the application user
RUN chown -R ordersuser:ordersgroup /app

# Switch to application user
USER ordersuser

# Expose port
EXPOSE 8080

# Set JVM options for production
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Add some documentation
LABEL org.opencontainers.image.documentation="https://github.com/yourcompany/orders-service/wiki" \
      org.opencontainers.image.licenses="MIT"