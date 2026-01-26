package com.ptit.onlinelearning.controller;


import com.ptit.onlinelearning.request.CompleteUploadRequest;
import com.ptit.onlinelearning.request.PresignRequest;
import com.ptit.onlinelearning.request.UploadFileRequest;
import com.ptit.onlinelearning.response.FileUploadResponse;
import com.ptit.onlinelearning.response.PresignResponse;
import com.ptit.onlinelearning.service.file.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import static com.ptit.onlinelearning.utility.HandleFileName.buildFilename;


@RestController
@RequestMapping("${api.prefix}/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService fileService;

    @PostMapping("/pre-signed-url")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_INSTRUCTOR', 'ROLE_STUDENT')")
    @Operation(summary = "Generate pre-signed URL for file upload")
    public ResponseEntity<Map<String, Object>> generateUrl(
            @RequestBody UploadFileRequest uploadFileRequest
            ) {
        
        FileUploadResponse response = fileService.generateUploadUrlAndCloudFrontUrl(uploadFileRequest);
        String filename = buildFilename(uploadFileRequest.getFileName());

        return ResponseEntity.ok(Map.of(
            "presignedUrl", response.getPresignedUrl(),
            "cloudFrontUrl", response.getCloudFrontUrl(),
            "filename", filename
        ));
    }

    @PostMapping("/lesson-presign")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_INSTRUCTOR', 'ROLE_STUDENT')")
    @Operation(summary = "Generate pre-signed URL to upload lesson")
    public ResponseEntity<PresignResponse> createPresignedUrls(@RequestBody PresignRequest req) {
        PresignResponse response = fileService.generatePresignUrls(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete")
    public ResponseEntity<String> completeUpload(@RequestBody CompleteUploadRequest req) {
        String fileLocation = fileService.completeMultipartUpload(
                req.getUploadId(),
                req.getFileKey(),
                req.getParts()
        );

        return ResponseEntity.ok("Upload completed successfully at: " + fileLocation);
    }
}
