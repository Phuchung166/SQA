package com.ptit.onlinelearning.utility;

import com.ptit.onlinelearning.common.type.CourseStatus;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.model.Category;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Lesson;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public final class SpecificationUtils {

    public static Specification<Course> filterCourses(
             Long categoryId, String search, CourseStatus status, EnrollmentType enrollmentType) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                Predicate titleLike = cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
                Predicate descLike = cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%");
                predicates.add(cb.or(titleLike, descLike));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (enrollmentType != null) {
                predicates.add(cb.equal(root.get("enrollmentType"), enrollmentType));
            }
            
//            predicates.add(cb.isNull(root.get("courseGroup")));
             predicates.add(cb.isFalse(root.get("isPreOrder")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<CourseModule> filterCourseModules(
            Long courseId, Boolean isPreview, String search
    ){
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                Predicate titleLike = cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
                Predicate descLike = cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%");
                predicates.add(cb.or(titleLike, descLike));
            }

            if(courseId != null){
                predicates.add(cb.equal(root.get("courseId"), courseId));
            }

            if(isPreview != null) {
                predicates.add(cb.equal(root.get("isPreview"), isPreview));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Lesson> filterLessons(
            Long moduleId, String search, String contentType, Boolean isMandatory
    ){

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                Predicate titleLike = cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
                Predicate descLike = cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%");
                predicates.add(cb.or(titleLike, descLike));
            }

            if(moduleId != null) {
                predicates.add(cb.equal(root.get("moduleId"), moduleId));
            }

            if(contentType != null){
                predicates.add(cb.equal(root.get("contentType"), contentType));
            }

            if(isMandatory != null) {
                predicates.add(cb.equal(root.get("isMandatory"), isMandatory));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Category> filterCategory(
            String search, Boolean isActive, Long parentId
    ){
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isEmpty()) {
                Predicate titleLike = cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%");
                Predicate descLike = cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%");
                predicates.add(cb.or(titleLike, descLike));
            }
            if(isActive != null){
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            if(parentId != null){
                predicates.add(cb.equal(root.get("parentId"), parentId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
