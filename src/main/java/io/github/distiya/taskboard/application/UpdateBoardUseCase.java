package io.github.distiya.taskboard.application;

import io.github.distiya.taskboard.domain.Board;
import io.github.distiya.taskboard.domain.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdateBoardUseCase {

    private final BoardRepository boardRepository;

    public void execute(Board board){
        boardRepository.saveBoard(board);
    }

}
