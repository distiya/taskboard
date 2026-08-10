package io.github.distiya.taskboard.domain;

import lombok.Data;

@Data
public class GenericTask {

    private String title;
    private GenericTaskType type;

}
