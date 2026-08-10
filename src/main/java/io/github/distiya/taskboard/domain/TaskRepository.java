package io.github.distiya.taskboard.domain;

import java.util.List;

public interface TaskRepository {

    List<Task> findAllTasksForUser(Long userId);
    void saveTask(Task task);

}
