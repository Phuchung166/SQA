package com.ptit.onlinelearning.response.instructor;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.EarningStatus;
import com.ptit.onlinelearning.model.InstructorMonthlyEarning;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class InstructorMonthlyEarningResponse {

    private Long id;
    
    private Integer year;
    
    private Integer month;
    
    private String email;
    
    private String accountName;
    
    private String firstName;
    
    private String lastName;
    
    private String bankName;
    
    private String bankAccount;
    
    private BigDecimal totalEarning;
    
    private EarningStatus paymentStatus;
    
    private String paidAt;

    public static InstructorMonthlyEarningResponse fromEntity(InstructorMonthlyEarning earning) {
        return InstructorMonthlyEarningResponse.builder()
                .id(earning.getId())
                .year(earning.getYear())
                .month(earning.getMonth())
                .email(earning.getInstructor().getUser().getEmail())
                .accountName(earning.getInstructor().getUser().getAccountName())
                .firstName(earning.getInstructor().getUser().getFirstName())
                .lastName(earning.getInstructor().getUser().getLastName())
                .bankName(earning.getInstructor().getBankName())
                .bankAccount(earning.getInstructor().getBankAccount())
                .totalEarning(earning.getTotalEarning())
                .paymentStatus(earning.getPaymentStatus())
                .paidAt(earning.getPaidAt() != null ? earning.getPaidAt().toString() : null)
                .build();
    }
}

