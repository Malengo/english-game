package com.englishgame.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UiController {

    @GetMapping("/")
    public String index() {
        // redirect to the static page placed under src/main/resources/static
        return "redirect:/create-lesson.html";
    }
}

