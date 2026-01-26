package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer>, JpaSpecificationExecutor<Role> {
    Optional<Role> findByName(RoleName name);
    boolean existsByName(RoleName name);
}
