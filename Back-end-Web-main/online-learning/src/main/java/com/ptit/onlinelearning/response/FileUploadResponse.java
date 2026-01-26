package com.ptit.onlinelearning.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponse {
    private String presignedUrl;  // URL để upload
    private String cloudFrontUrl; // URL để access file sau khi upload
}
