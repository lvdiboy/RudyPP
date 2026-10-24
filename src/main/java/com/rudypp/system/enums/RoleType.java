package com.rudypp.system.enums;

import lombok.Getter;


/**
 * @author Rudy Lyu
 */
@Getter
public enum RoleType {
    USER("USER", "User"),
    TEMP_USER("TEMP_USER", "Temporary user"),
    MANAGER("MANAGER", "Manager"),
    ADMIN("ADMIN", "Admin");
    private final String name;
    private final String description;

    RoleType(java.lang.String name, java.lang.String description) {
        this.name = name;
        this.description = description;
    }
}
