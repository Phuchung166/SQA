package com.ptit.onlinelearning.response;

import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.response.view.Views;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PageableResponse<T>{
    @JsonView(Views.Basic.class)
    private int currentPage;
    
    @JsonView(Views.Basic.class)
    private int totalPages;
    
    @JsonView(Views.Basic.class)
    private long totalElements;
    
    @JsonView(Views.Basic.class)
    private int pageSize;
    
    @JsonView(Views.Basic.class)
    private Boolean hasNext;
    
    @JsonView(Views.Basic.class)
    private Boolean hasPrevious;
    
    @JsonView(Views.Basic.class)
    private List<T> data;
}
