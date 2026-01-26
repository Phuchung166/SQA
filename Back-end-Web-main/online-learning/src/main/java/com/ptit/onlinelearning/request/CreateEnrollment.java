package com.ptit.onlinelearning.request;



import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseGroup;
import com.ptit.onlinelearning.model.Order;
import com.ptit.onlinelearning.model.User;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateEnrollment {
    private Course course;
    private CourseGroup courseGroup;
    private Order order;
    private User user;
}
