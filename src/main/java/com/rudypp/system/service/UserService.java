package com.rudypp.system.service;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.common.collect.ImmutableMap;

import com.rudypp.system.entity.Role;
import com.rudypp.system.entity.User;
import com.rudypp.system.entity.UserRole;
import com.rudypp.system.enums.RoleType;
import com.rudypp.system.exception.RoleNotFoundException;
import com.rudypp.system.exception.UserNameAlreadyExistException;
import com.rudypp.system.exception.UserNameNotFoundException;
import com.rudypp.system.repository.RoleRepository;
import com.rudypp.system.repository.UserRepository;
import com.rudypp.system.repository.UserRoleRepository;
import com.rudypp.system.web.representation.UserRepresentation;
import com.rudypp.system.web.request.UserRegisterRequest;
import com.rudypp.system.web.request.UserUpdateRequest;
import lombok.RequiredArgsConstructor;

/**
 * @author Rudy Lyu
 */
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class UserService {

    public static final String USERNAME = "username:";
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final StringRedisTemplate stringRedisTemplate;

    @Transactional(rollbackFor = Exception.class)
    public void save(UserRegisterRequest userRegisterRequest) {
        ensureUserNameNotExist(userRegisterRequest.getUserName());
        User user = userRegisterRequest.toUser();
        user.setPassword(bCryptPasswordEncoder.encode(userRegisterRequest.getPassword()));
        userRepository.save(user);
        // Give the new user two roles: USER and MANAGER
        Role studentRole = roleRepository.findByName(RoleType.USER.getName()).orElseThrow(() -> new RoleNotFoundException(ImmutableMap.of("roleName", RoleType.USER.getName())));
        Role managerRole = roleRepository.findByName(RoleType.MANAGER.getName()).orElseThrow(() -> new RoleNotFoundException(ImmutableMap.of("roleName", RoleType.MANAGER.getName())));
        userRoleRepository.save(new UserRole(user, studentRole));
        userRoleRepository.save(new UserRole(user, managerRole));
    }

    public User find(String userName) {
        return userRepository.findByUserName(userName).orElseThrow(() -> new UserNameNotFoundException(ImmutableMap.of(USERNAME, userName)));
    }

    public void update(UserUpdateRequest userUpdateRequest) {
        User user = find(userUpdateRequest.getUserName());
        boolean revokeToken = false;
        if (Objects.nonNull(userUpdateRequest.getFullName())) {
            user.setFullName(userUpdateRequest.getFullName());
        }
        if (Objects.nonNull(userUpdateRequest.getPassword())) {
            user.setPassword(bCryptPasswordEncoder.encode(userUpdateRequest.getPassword()));
            revokeToken = true;
        }
        if (Objects.nonNull(userUpdateRequest.getEnabled())) {
            user.setEnabled(userUpdateRequest.getEnabled());
            revokeToken = revokeToken || !userUpdateRequest.getEnabled();
        }
        userRepository.save(user);
        // After a password change or disabling the user, revoke the user's issued token right away
        if (revokeToken) {
            stringRedisTemplate.delete(user.getId().toString());
        }
    }

    public void delete(String userName) {
        User user = find(userName);
        userRepository.deleteByUserName(userName);
        // After deleting the user, revoke the user's issued token right away
        stringRedisTemplate.delete(user.getId().toString());
    }

    public Page<UserRepresentation> getAll(int pageNum, int pageSize) {
        return userRepository.findAll(PageRequest.of(pageNum, pageSize)).map(User::toUserRepresentation);
    }

    public boolean check(String currentPassword, String password) {
        return this.bCryptPasswordEncoder.matches(currentPassword, password);
    }

    private void ensureUserNameNotExist(String userName) {
        boolean exist = userRepository.findByUserName(userName).isPresent();
        if (exist) {
            throw new UserNameAlreadyExistException(ImmutableMap.of(USERNAME, userName));
        }
    }
}
