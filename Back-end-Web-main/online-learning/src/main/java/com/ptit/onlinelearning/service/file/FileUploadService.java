package com.ptit.onlinelearning.service.file;


import com.ptit.onlinelearning.common.base.S3ObjectInputStreamWrapper;
import com.ptit.onlinelearning.request.CompletedPartRequest;
import com.ptit.onlinelearning.request.PresignRequest;
import com.ptit.onlinelearning.request.UploadFileRequest;
import com.ptit.onlinelearning.response.FileUploadResponse;
import com.ptit.onlinelearning.response.PresignResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.ptit.onlinelearning.utility.HandleFileName.*;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private static final int SINGLE_UPLOAD_LIMIT = 50 * 1024 * 1024; // 50MB


    @Value("${aws.bucket}")
    private String bucketName;

    @Value("${aws.cloudfront.host}")
    private String cloudfrontDomain;

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;


    private String generateGetPresignedUrl(String filePath) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(filePath)
                .build();

        // you can change expiration time here
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(60))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    private String generatePutPresignedUrl(String filePath) {
        PutObjectRequest.Builder putObjectRequestBuilder = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(filePath);
        PutObjectRequest putObjectRequest = putObjectRequestBuilder.build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(60))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        return presignedRequest.url().toString();
    }

    public S3ObjectInputStreamWrapper downloadFile(String fileName) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

        ResponseInputStream<GetObjectResponse> s3ObjectResponse = s3Client.getObject(getObjectRequest);
        String eTag = s3ObjectResponse.response().eTag();
        return new S3ObjectInputStreamWrapper(s3ObjectResponse, eTag);
    }

    public String generateCloudFrontUrl(String filePath) {
        String cleanDomain = cloudfrontDomain.endsWith("/") ?
            cloudfrontDomain.substring(0, cloudfrontDomain.length() - 1) : cloudfrontDomain;
        String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
        
        return cleanDomain + "/" + cleanPath;
    }

    public FileUploadResponse generateUploadUrlAndCloudFrontUrl(UploadFileRequest uploadFileRequest) {
        String directory = determineDirectory(uploadFileRequest.getExtension());
        String filename = buildFilename(uploadFileRequest.getFileName());
        String filePath = buildFilePathWithDirectory(directory, filename);
        String contentType = uploadFileRequest.getVariant()+"/"+ uploadFileRequest.getExtension();
        String presignedUrl = generatePutPresignedUrl(filePath);
        String cloudFrontUrl = generateCloudFrontUrl(filePath);
        return new FileUploadResponse(presignedUrl, cloudFrontUrl);
    }

    public PresignResponse generatePresignUrls(PresignRequest req) {
        String directory = determineDirectory(req.getExtension());
        String s3_key = buildFilePathWithDirectory(directory, buildFilename(req.getFileName()));
        String contentType = req.getVariant()+"/"+req.getExtension();
        if(req.getFileSize() <= SINGLE_UPLOAD_LIMIT) {
            String presignedUrl = generatePutPresignedUrl(s3_key);
            return PresignResponse.builder()
                    .type("single")
                    .uploadUrl(presignedUrl)
                    .build();
        }
        return generateMultipartUrls(s3_key, req.getFileSize(), contentType);

    }

    private PresignResponse generateMultipartUrls(String objectKey, long fileSize, String contentType) {
        CreateMultipartUploadRequest createReq = CreateMultipartUploadRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(contentType)
                .build();

        CreateMultipartUploadResponse createRes = s3Client.createMultipartUpload(createReq);
        String uploadId = createRes.uploadId();

        long partSize = 10 * 1024 * 1024; // 10MB
        int totalParts = (int) Math.ceil((double) fileSize / partSize);

        List<String> partUrls = new ArrayList<>();
        for (int partNumber = 1; partNumber <= totalParts; partNumber++) {
            UploadPartRequest uploadPartReq = UploadPartRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .uploadId(uploadId)
                    .partNumber(partNumber)
                    .build();

            UploadPartPresignRequest presignReq = UploadPartPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(30))
                    .uploadPartRequest(uploadPartReq)
                    .build();

            PresignedUploadPartRequest presigned = s3Presigner.presignUploadPart(presignReq);
            partUrls.add(presigned.url().toString());
        }

        return PresignResponse.builder()
                .type("multipart")
                .uploadId(uploadId)
                .partUrls(partUrls)
                .build();
    }

    public String completeMultipartUpload(String uploadId, String fileKey, List<CompletedPartRequest> parts) {
        List<CompletedPart> completedParts = parts.stream()
                .map(p -> CompletedPart.builder()
                        .partNumber(p.getPartNumber())
                        .eTag(p.getETag())
                        .build())
                .collect(Collectors.toList());

        CompleteMultipartUploadRequest completeRequest = CompleteMultipartUploadRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .uploadId(uploadId)
                .multipartUpload(CompletedMultipartUpload.builder()
                        .parts(completedParts)
                        .build())
                .build();

        CompleteMultipartUploadResponse response = s3Client.completeMultipartUpload(completeRequest);

        return response.location();
    }



}
