package com.rudypp;

import java.util.Objects;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.rudypp.system.entity.Role;
import com.rudypp.system.entity.User;
import com.rudypp.system.entity.UserRole;
import com.rudypp.system.enums.RoleType;
import com.rudypp.system.repository.RoleRepository;
import com.rudypp.system.repository.UserRepository;
import com.rudypp.system.repository.UserRoleRepository;

/**
 * @author Rudy Lyu
 */
@SpringBootApplication
public class RudyPPApplication implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public RudyPPApplication(RoleRepository roleRepository, UserRepository userRepository, UserRoleRepository userRoleRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    public static void main(java.lang.String[] args) {
        SpringApplication.run(RudyPPApplication.class, args);
    }

    @Override
    public void run(java.lang.String... args) {
        for (RoleType roleType : RoleType.values()) {
            if (!roleRepository.existsByName(roleType.getName())) {
                roleRepository.save(new Role(roleType.getName(), roleType.getDescription()));
            }
        }

        if (!userRepository.existsByUserName("root")) {
            BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
            User user = User.builder()
                    .enabled(true)
                    .fullName("admin")
                    .userName("root")
                    .password(bCryptPasswordEncoder.encode("root"))
                    .build();
            userRepository.save(user);
        }

        User user = userRepository.findByUserName("root").orElseThrow(() -> new IllegalStateException("Default admin user not found"));
        Role role = roleRepository.findByName(RoleType.ADMIN.getName())
                .orElseThrow(() -> new IllegalStateException("Admin role not found"));

        boolean linked = userRoleRepository.findAll().stream()
                .anyMatch(userRole -> Objects.equals(userRole.getUser().getId(), user.getId())
                        && Objects.equals(userRole.getRole().getId(), role.getId()));
        if (!linked) {
            userRoleRepository.save(new UserRole(user, role));
        }
    }
}
