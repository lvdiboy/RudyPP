package com.rudypp.system.web.request;

import com.rudypp.system.entity.User;
import com.rudypp.system.validator.FullName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * @author Rudy Lyu
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String password;
    @FullName
    @NotBlank
    private String fullName;

    public User toUser() {
        return User.builder()
                .fullName(this.getFullName())
                .userName(this.getUserName())
                .enabled(true)
                .build();
    }
}
