package com.rudypp.system.config;

import java.time.Duration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author Rudy Lyu
 * URL layout: the React UI (static files from RudyPPUI, packaged into static/) is served at /,
 * and every REST controller is served under /api. Actuator gets the same prefix through
 * management.endpoints.web.base-path in application.yaml.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    public static final String API_PREFIX = "/api";

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // @RequestMapping("/auth") on a @RestController becomes /api/auth
        configurer.addPathPrefix(API_PREFIX, HandlerTypePredicate.forAnnotation(RestController.class));
    }

    /**
     * Vite puts a content hash in every file name under /assets (JS, CSS, the photo),
     * so a changed file always gets a new URL. Browsers may keep them for a year instead of downloading
     * megabytes again on every visit. index.html has no hash and keeps Spring Security's no-cache headers,
     * so a new deployment is picked up right away.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());
    }
}
