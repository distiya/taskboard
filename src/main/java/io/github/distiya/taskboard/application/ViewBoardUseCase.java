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
            board.setSelectiveInvestTasks(new ArrayList<>());
            board.setDoFirstDriveDailyTasks(new ArrayList<>());
            board.setWorkInTasks(new ArrayList<>());
            board.setIgnoreTasks(new ArrayList<>());
            board.setSupportTasks(new ArrayList<>());
            board.setParkingTasks(new ArrayList<>());
        }
        return board;
    }

}
