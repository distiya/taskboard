package io.github.distiya.taskboard.infrastructure;

import io.github.distiya.taskboard.domain.Board;
import io.github.distiya.taskboard.domain.BoardRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class GoogleBoardRepository implements BoardRepository {

    Map<UUID, Board> userBoards = new HashMap<>();

    @Override
    public void saveBoard(Board board) {
        userBoards.put(board.getUserId(),board);
    }

    @Override
    public Board findBoardByUserId(UUID userId) {
        return userBoards.get(userId);
    }
}
