package com.englishgame.backend.service;

import java.text.Normalizer;
import org.springframework.stereotype.Service;

@Service
public class SlugService {

    public String fromTitle(String title) {
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        if (normalized.isBlank()) {
            return "lesson";
        }
        return normalized;
    }
}
