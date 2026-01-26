package com.ptit.onlinelearning.response.instructor;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class InstructorCurrentMonthEarning {

    private String currentMonth;

    private String email;

    private String accountName;

    private String bankName;

    private String bankAccount;

    private String firstName;

    private String lastName;

    private BigDecimal currentMonthEarning;
}
