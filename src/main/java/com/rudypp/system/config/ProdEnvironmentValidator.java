package com.rudypp.system.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Profiles;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * @author Rudy Lyu
 * Before the prod profile starts, checks that all database environment variables are set.
 * Otherwise Spring puts ${DB_HOST} literally into the JDBC URL and fails with a confusing connection error,
 * so this fails early with a clear message instead.
 * Registered in META-INF/spring.factories.
 */
public class ProdEnvironmentValidator implements EnvironmentPostProcessor {

    private static final List<String> REQUIRED_VARIABLES = List.of("DB_HOST", "DB_NAME", "DB_USERNAME", "DB_PASSWORD");

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (!environment.acceptsProfiles(Profiles.of("prod"))) {
            return;
        }
        List<String> missing = REQUIRED_VARIABLES.stream()
                .filter(name -> !StringUtils.hasText(environment.getProperty(name)))
                .toList();
        if (!missing.isEmpty()) {
            throw new IllegalStateException("Missing required environment variables for the prod profile: " + String.join(", ", missing));
        }
    }
}
