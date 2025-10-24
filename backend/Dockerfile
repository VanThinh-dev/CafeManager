# Stage 1: Build the application
FROM eclipse-temurin:23-jdk-alpine AS build

# Set build arguments for better caching
ARG GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.parallel=true"

# Install necessary packages
RUN apk add --no-cache \
    curl \
    bash

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and configuration files first (for better layer caching)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Make Gradle wrapper executable
RUN chmod +x gradlew

# Download dependencies (this layer will be cached unless build.gradle changes)
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build the application
RUN ./gradlew clean build -x test --no-daemon

# Stage 2: Create the final runtime image
FROM eclipse-temurin:23-jre-alpine

# Install necessary packages for production
RUN apk add --no-cache \
    curl \
    bash

# Set working directory
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the port
EXPOSE 8080

# Set JVM options for production
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"

# Run the application
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-XX:+UseG1GC", "-XX:+UseContainerSupport", "-jar", "app.jar"]