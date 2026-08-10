package io.github.distiya.taskboard.application;

import io.github.distiya.taskboard.domain.Board;
import io.github.distiya.taskboard.domain.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ViewBoardUseCase {

    private final BoardRepository boardRepository;

    public Board execute(UUID userid){
        Board board = boardRepository.findBoardByUserId(userid);
        if(board == null){
            board = new Board();
            board.setTasks(new ArrayList<>());
            board.setGenericTasks(new ArrayList<>());
        }
        return board;
    }

}
