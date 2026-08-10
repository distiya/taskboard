package io.github.distiya.taskboard.domain;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SubTask {

    private String title;
    private LocalDate dueDate;
    private Boolean completed;

}
