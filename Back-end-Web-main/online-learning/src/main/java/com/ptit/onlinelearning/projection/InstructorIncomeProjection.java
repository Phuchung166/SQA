package com.ptit.onlinelearning.projection;

import java.math.BigDecimal;

public interface InstructorIncomeProjection {
    String getCourseTitle();
    BigDecimal getIncome();
    String getCourseType();
    String getThumbnail();
    Long getTotalSales();
}
