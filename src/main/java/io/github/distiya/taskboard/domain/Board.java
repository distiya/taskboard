package io.github.distiya.taskboard.domain;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class Board {

    private UUID userId;
    private List<Task> selectiveInvestTasks;
    private List<Task> doFirstDriveDailyTasks;
    private List<Task> workInTasks;
    private List<Task> ignoreTasks;
    private List<GenericTask> genericTasks;

}
