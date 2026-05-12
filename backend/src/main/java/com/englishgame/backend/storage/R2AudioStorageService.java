package com.englishgame.backend.storage;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class R2AudioStorageService implements AudioStorageService {

    private final S3Client s3Client;
    private final R2Properties properties;

    public R2AudioStorageService(S3Client s3Client, R2Properties properties) {
        this.s3Client = s3Client;
        this.properties = properties;
    }

    @Override
    public UploadedAudio upload(byte[] content, String key, String contentType) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(properties.bucket())
                .key(key)
                .contentType(contentType)
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(content));
        return new UploadedAudio(key, publicUrlFor(key));
    }

    @Override
    public void delete(String key) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(properties.bucket())
                .key(key)
                .build();

        s3Client.deleteObject(request);
    }

    private String publicUrlFor(String key) {
        String baseUrl = properties.publicBaseUrl();
        if (baseUrl.endsWith("/")) {
            return baseUrl + key;
        }
        return baseUrl + "/" + key;
    }
}
