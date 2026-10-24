package com.rudypp.system.exception;

import java.util.Map;

/**
 * @author Rudy Lyu
 */
public class UserNameNotFoundException extends BaseException {
    public UserNameNotFoundException(Map<String, Object> data) {
        super(ErrorCode.USER_NAME_NOT_FOUND, data);
    }
}
