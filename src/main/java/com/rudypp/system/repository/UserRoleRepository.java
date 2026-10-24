package com.rudypp.system.repository;

import com.rudypp.system.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author Rudy Lyu
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

}
