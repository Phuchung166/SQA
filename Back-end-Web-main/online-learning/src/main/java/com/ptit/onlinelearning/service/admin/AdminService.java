package com.ptit.onlinelearning.service.admin;

import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.OrderRepository;
import com.ptit.onlinelearning.repository.UserRepository;
import com.ptit.onlinelearning.response.SystemStatisticsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;


@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService implements IAdminService{

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;


    @Override
    public SystemStatisticsResponse getSystemStatistics() {
        Long totalUsers = userRepository.countAllUsers();
        Long totalInstructors = userRepository.countUsersByRole(RoleName.INSTRUCTOR);
        Long totalCourses = courseRepository.count();
        Long totalOrders = orderRepository.count();
        Long totalSuccessOrders = orderRepository.countSuccessOrders();

        BigDecimal totalRevenue = orderRepository.findTotalSuccessOrdersRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }
        BigDecimal systemIncome = totalRevenue
                .multiply(new BigDecimal("30"))
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        
        return SystemStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalInstructors(totalInstructors)
                .totalCourses(totalCourses)
                .totalOrders(totalOrders)
                .totalSuccessOrders(totalSuccessOrders)
                .totalRevenue(totalRevenue)
                .systemIncome(systemIncome)
                .build();
    }
}
