package com.rudypp.system.exception;

import java.util.Map;

/**
 * @author Rudy Lyu
 */
public class RoleNotFoundException extends BaseException {
    public RoleNotFoundException(Map<String, Object> data) {
        super(ErrorCode.ROLE_NOT_FOUND, data);
    }
}
