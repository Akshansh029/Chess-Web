# Stage 1 — Build
# Use Maven + JDK 21 to compile and package the JAR
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy only pom.xml first — lets Docker cache the dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build — skipping tests
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2 — Runtime
# Use JRE-only image (no compiler, no Maven) — much smaller
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the final JAR from the builder stage
COPY --from=builder /app/target/chess-web-0.0.1-SNAPSHOT.jar app.jar

# Give ownership to non-root user
RUN chown appuser:appgroup app.jar

USER appuser

# Expose the Spring Boot default port
EXPOSE 8080

# JVM tuning for containerized environments
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]