package com.englishgame.backend.repository;

import com.englishgame.backend.entity.AudioAsset;
import com.englishgame.backend.entity.AudioAssetStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AudioAssetRepository extends JpaRepository<AudioAsset, UUID> {
    Optional<AudioAsset> findFirstByTextAndVoiceAndLanguageAndStatus(
            String text,
            String voice,
            String language,
            AudioAssetStatus status
    );
}
