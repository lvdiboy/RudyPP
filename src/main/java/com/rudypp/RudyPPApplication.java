package com.rudypp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author Rudy Lyu
 * Roles and the default admin account are created by scripts/mysql-init.sql
 */
@SpringBootApplication
public class RudyPPApplication {

    public static void main(String[] args) {
        SpringApplication.run(RudyPPApplication.class, args);
    }
}
