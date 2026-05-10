package com.ptit.onlinelearning.service.admin;

import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.OrderRepository;
import com.ptit.onlinelearning.repository.UserRepository;
import com.ptit.onlinelearning.response.SystemStatisticsResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Unit Test cho AdminService
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private OrderRepository orderRepository;

    @InjectMocks
    private AdminService adminService;

    // TC-ADM-001: getSystemStatistics với doanh thu > 0
    @Test
    @DisplayName("TC-ADM-001: Lấy thống kê hệ thống với doanh thu hợp lệ")
    void getSystemStatistics_withRevenue() {
        when(userRepository.countAllUsers()).thenReturn(100L);
        when(userRepository.countUsersByRole(RoleName.INSTRUCTOR)).thenReturn(10L);
        when(courseRepository.count()).thenReturn(50L);
        when(orderRepository.count()).thenReturn(200L);
        when(orderRepository.countSuccessOrders()).thenReturn(150L);
        when(orderRepository.findTotalSuccessOrdersRevenue()).thenReturn(new BigDecimal("100000"));

        SystemStatisticsResponse res = adminService.getSystemStatistics();

        assertThat(res.getTotalUsers()).isEqualTo(100L);
        assertThat(res.getTotalInstructors()).isEqualTo(10L);
        assertThat(res.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(res.getSystemIncome()).isEqualByComparingTo(new BigDecimal("30000")); // 30% of 100000
    }

    // TC-ADM-002: getSystemStatistics doanh thu = null
    @Test
    @DisplayName("TC-ADM-002: Doanh thu null -> Tính toán mặc định là 0")
    void getSystemStatistics_nullRevenue() {
        when(userRepository.countAllUsers()).thenReturn(0L);
        when(userRepository.countUsersByRole(RoleName.INSTRUCTOR)).thenReturn(0L);
        when(courseRepository.count()).thenReturn(0L);
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.countSuccessOrders()).thenReturn(0L);
        when(orderRepository.findTotalSuccessOrdersRevenue()).thenReturn(null);

        SystemStatisticsResponse res = adminService.getSystemStatistics();

        assertThat(res.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(res.getSystemIncome()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
