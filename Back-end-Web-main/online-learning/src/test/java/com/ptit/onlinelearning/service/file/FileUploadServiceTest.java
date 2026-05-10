package com.ptit.onlinelearning.service.file;

import com.ptit.onlinelearning.request.UploadFileRequest;
import com.ptit.onlinelearning.response.FileUploadResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.MalformedURLException;
import java.net.URL;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit Test cho FileUploadService
 */
@ExtendWith(MockitoExtension.class)
class FileUploadServiceTest {

    @Mock private S3Client s3Client;
    @Mock private S3Presigner s3Presigner;

    @InjectMocks
    private FileUploadService fileUploadService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileUploadService, "bucketName", "test-bucket");
        ReflectionTestUtils.setField(fileUploadService, "cloudfrontDomain", "https://cdn.example.com");
    }

    // TC-FILE-001: Cloudfront URL Format
    @Test
    @DisplayName("TC-FILE-001: Hàm generateCloudFrontUrl hoạt động đúng format")
    void generateCloudFrontUrl_success() {
        String res = fileUploadService.generateCloudFrontUrl("/images/test.png");
        assertThat(res).isEqualTo("https://cdn.example.com/images/test.png");
    }

    // TC-FILE-002: generateUploadUrlAndCloudFrontUrl
    @Test
    @DisplayName("TC-FILE-002: Sinh Pre-signed URL và Cloudfront URL thành công")
    void generateUploadUrlAndCloudFrontUrl_success() throws MalformedURLException {
        UploadFileRequest req = new UploadFileRequest();
        req.setFileName("test");
        req.setExtension("png");
        req.setVariant("image");

        PresignedPutObjectRequest presignedReq = mock(PresignedPutObjectRequest.class);
        when(presignedReq.url()).thenReturn(new URL("https://s3.amazonaws.com/test-bucket/images/test.png"));
        
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presignedReq);

        FileUploadResponse res = fileUploadService.generateUploadUrlAndCloudFrontUrl(req);

        assertThat(res.getCloudFrontUrl()).contains("https://cdn.example.com/");
        assertThat(res.getPresignedUrl()).isEqualTo("https://s3.amazonaws.com/test-bucket/images/test.png");
    }
}
