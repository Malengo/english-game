package com.englishgame.backend.dto;

import com.englishgame.backend.entity.AudioAsset;
import com.englishgame.backend.entity.AudioAssetStatus;
import java.util.UUID;

public record AudioResponse(
        UUID id,
        String text,
        String voice,
        String language,
        String format,
        String r2Key,
        String publicUrl,
        AudioAssetStatus status,
        String errorMessage
) {
    public static AudioResponse from(AudioAsset audio) {
        return new AudioResponse(
                audio.getId(),
                audio.getText(),
                audio.getVoice(),
                audio.getLanguage(),
                audio.getFormat(),
                audio.getR2Key(),
                audio.getPublicUrl(),
                audio.getStatus(),
                audio.getErrorMessage()
        );
    }
}
