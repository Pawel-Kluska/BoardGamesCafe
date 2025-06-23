package com.socialmicroservice.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.socialmicroservice.entities.Session;
import com.socialmicroservice.services.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/sessions")
public class MainController {

    private final SocialService socialService;

    @GetMapping
    public ResponseEntity<?> getSessions(@RequestParam(required = false) String email,
                                         @RequestParam(required = false) String date) throws JsonProcessingException {
        if (email != null) {
            return ResponseEntity.ok(socialService.getSessions(email));
        } else if (date != null) {
            LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            return ResponseEntity.ok(socialService.getSessions(localDate));
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Session> addToSession(@RequestBody Session sessionData) throws JsonProcessingException {
        return ResponseEntity.ok(socialService.addToSession(sessionData));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable Long sessionId,
                                           @RequestParam String email) {
        try {
            socialService.deleteFromSession(sessionId, email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting session: " + e.getMessage());
        }
    }

}
