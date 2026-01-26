package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.Option;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;


@Repository
public interface OptionRepository extends JpaRepository<Option,Long>, JpaSpecificationExecutor<Option> {

    boolean existsById(@NonNull  Long  id);

    Long countByIdIn(Collection<Long> ids);





}
