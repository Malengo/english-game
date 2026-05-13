package com.englishgame.backend.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emojis")
public class EmojiController {

    @GetMapping
    public List<String> list() {
        return List.of(
                "\uD83D\uDD34",
                "\uD83D\uDFE2",
                "\uD83D\uDD35",
                "\uD83D\uDFE1",
                "\u2764\uFE0F",
                "\u2B50",
                "\uD83C\uDF4E",
                "\uD83C\uDF4C",
                "\uD83D\uDCD8",
                "\u270F\uFE0F",
                "\uD83D\uDC4D",
                "\uD83D\uDC4D\uD83C\uDFFB",
                "\uD83D\uDC4D\uD83C\uDFFC",
                "\uD83D\uDC4D\uD83C\uDFFD",
                "\uD83D\uDC4D\uD83C\uDFFE",
                "\uD83D\uDC4D\uD83C\uDFFF",
                "\uD83D\uDE42"
        );
    }
}

