package io.github.distiya.taskboard.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Comment {

    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
