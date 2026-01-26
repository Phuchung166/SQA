package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AnswerRepository extends JpaRepository<Answer,Long>, JpaSpecificationExecutor<Answer> {
}
