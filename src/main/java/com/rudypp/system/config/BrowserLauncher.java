package com.rudypp.system.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Locale;

/**
 * @author Rudy Lyu
 * 项目启动完成后，自动用系统默认浏览器打开登录页面。
 * 通过 app.open-browser=false 可以关闭（测试环境中已关闭）。
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.open-browser", havingValue = "true", matchIfMissing = true)
public class BrowserLauncher {

    private final Environment environment;

    public BrowserLauncher(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void openLoginPage() {
        String port = environment.getProperty("local.server.port", environment.getProperty("server.port", "8080"));
        String contextPath = environment.getProperty("server.servlet.context-path", "");
        if (contextPath.endsWith("/")) {
            contextPath = contextPath.substring(0, contextPath.length() - 1);
        }
        String url = "http://localhost:" + port + contextPath + "/";
        log.info("登录页面地址: {}", url);

        String os = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
        ProcessBuilder processBuilder;
        if (os.contains("win")) {
            processBuilder = new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url);
        } else if (os.contains("mac")) {
            processBuilder = new ProcessBuilder("open", url);
        } else {
            processBuilder = new ProcessBuilder("xdg-open", url);
        }
        try {
            processBuilder.start();
        } catch (IOException e) {
            log.warn("无法自动打开浏览器，请手动访问 {} ({})", url, e.getMessage());
        }
    }
}
