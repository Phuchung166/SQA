package com.ptit.onlinelearning.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ImportQuestionRequest {

    private String description;

    @NotBlank(message = "Title must not be blank")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotNull(message = "Module ID must not be null")
    private Long moduleId;


    @NotNull
    private Boolean isMandatory;


    @NotNull(message = "File must not be null")
    private MultipartFile file;
}
