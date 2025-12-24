package com.melodyground.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CompositionRequest {
    @NotBlank(message = "作品標題不能為空")
    private String title;

    private String description;

    @NotNull(message = "速度不能為空")
    private Integer tempo;

    @NotNull(message = "音符序列不能為空")
    private List<NoteSequenceDto> notes;
}
