package com.ptit.onlinelearning.filters;


import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class PublicEndpoints {

    public static final Map<String, List<String>> ENDPOINTS = Map.of(
            HttpMethod.GET.name(), List.of(
                    "/api/v1/categories/**",
                    "/api/v1/courses",
                    "/api/v1/courses/{id}",
                    "/api/v1/lessons/**",
                    "/api/v1/course-modules",
                    "/api/v1/sub-courses/**",
                    "/api/v1/instructors/profile/{slug}",
                    "/api/v1/instructors/courses/{slug}",
                    "/api/v1/instructors/top",
                    "/api/v1/course-groups/{id}",
                    "/api/v1/course-groups",
                    "/api/v1/reviews",
                    "/api/v1/reviews/{id}",
                    "/api/v1/reviews/statistics/course/{courseId}",
                    "/api/v1/payments/**",
                    "/api/v1/admin/statistics-system"
            )
    );
}
