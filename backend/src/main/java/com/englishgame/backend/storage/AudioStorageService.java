package com.englishgame.backend.storage;

public interface AudioStorageService {
    UploadedAudio upload(byte[] content, String key, String contentType);

    void delete(String key);
}
