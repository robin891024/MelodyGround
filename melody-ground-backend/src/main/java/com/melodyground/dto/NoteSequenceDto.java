package com.melodyground.dto;

import lombok.Data;

@Data
public class NoteSequenceDto {
    private Long timestamp;
    private String note;
    private String instrument;
    private Integer duration;
    private Integer velocity;
}
