package io.github.distiya.taskboard.domain;

import java.util.UUID;

public interface BoardRepository {

    void saveBoard(Board board);
    Board findBoardByUserId(UUID userId);

}
