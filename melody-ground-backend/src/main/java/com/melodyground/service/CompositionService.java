package com.melodyground.service;

import com.melodyground.dto.CompositionRequest;
import com.melodyground.model.Composition;
import com.melodyground.model.NoteSequence;
import com.melodyground.model.User;
import com.melodyground.repository.CompositionRepository;
import com.melodyground.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompositionService {

    private final CompositionRepository compositionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<Composition> getAllCompositions() {
        return compositionRepository.findByUser(getCurrentUser());
    }

    @Transactional(readOnly = true)
    public Composition getComposition(Long id) {
        Composition composition = compositionRepository.findById(id).orElseThrow();
        if (!composition.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("無權存取此作品");
        }
        return composition;
    }

    @Transactional
    public Composition createComposition(CompositionRequest request) {
        User user = getCurrentUser();

        Composition composition = Composition.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .tempo(request.getTempo())
                .build();

        List<NoteSequence> sequences = request.getNotes().stream()
                .map(dto -> NoteSequence.builder()
                        .composition(composition)
                        .timestamp(dto.getTimestamp())
                        .note(dto.getNote())
                        .instrument(dto.getInstrument())
                        .duration(dto.getDuration())
                        .velocity(dto.getVelocity())
                        .build())
                .collect(Collectors.toList());

        composition.setNoteSequences(sequences);
        return compositionRepository.save(composition);
    }

    @Transactional
    public void deleteComposition(Long id) {
        Composition composition = getComposition(id);
        compositionRepository.delete(composition);
    }
}
