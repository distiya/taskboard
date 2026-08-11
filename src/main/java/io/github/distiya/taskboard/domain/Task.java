package io.github.distiya.taskboard.domain;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Task {

    private String title;
    private String description;
    private LocalDate dueDate;
    private Boolean isSupportRequired;
    private List<SubTask> subTasks;
    private List<Comment> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean completed;

}
