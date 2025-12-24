package com.melodyground.controller;

import com.melodyground.dto.CompositionRequest;
import com.melodyground.service.CompositionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compositions")
@RequiredArgsConstructor
public class CompositionController {

    private final CompositionService compositionService;

    @GetMapping
    public ResponseEntity<?> getAllCompositions() {
        return ResponseEntity.ok(compositionService.getAllCompositions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComposition(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(compositionService.getComposition(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createComposition(@Valid @RequestBody CompositionRequest request) {
        return ResponseEntity.ok(compositionService.createComposition(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComposition(@PathVariable Long id) {
        try {
            compositionService.deleteComposition(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(404).body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
