package com.melodyground.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "note_sequences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteSequence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "composition_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference // 標記為從屬端
    private Composition composition;

    @Column(nullable = false)
    private Long timestamp;

    @Column(nullable = false, length = 10)
    private String note;

    @Column(nullable = false, length = 50)
    private String instrument;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    @Builder.Default
    private Integer velocity = 100;
}
