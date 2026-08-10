package io.github.distiya.taskboard.domain;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class Board {

    private UUID userId;
    private List<Task> tasks;
    private List<GenericTask> genericTasks;

}
