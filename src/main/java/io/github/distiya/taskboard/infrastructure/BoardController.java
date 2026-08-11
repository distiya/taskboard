package io.github.distiya.taskboard.infrastructure;

import io.github.distiya.taskboard.application.UpdateBoardUseCase;
import io.github.distiya.taskboard.application.ViewBoardUseCase;
import io.github.distiya.taskboard.domain.Board;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class BoardController {

    private final ViewBoardUseCase viewBoardUseCase;
    private final UpdateBoardUseCase updateBoardUseCase;

    @GetMapping("/")
    public String home(Authentication authentication) {

        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {

            return "redirect:/my-board";
        }

        return "redirect:/login";
    }

    @GetMapping("/my-board")
    public String myBoard(Authentication authentication, Model model) {

        CustomUserDetails principal =
                (CustomUserDetails) authentication.getPrincipal();
        Board board = viewBoardUseCase.execute(principal.getUserId());
        model.addAttribute("board", board);
        return "my-board";
    }

    @GetMapping("/member-board/{memberId}")
    public String myBoard(@PathVariable("memberId") String memberId, Model model) {
        UUID memberUUID = UUID.fromString(memberId);
        Board board = viewBoardUseCase.execute(memberUUID);
        model.addAttribute("board", board);
        return "member-board";
    }

    @PostMapping("/my-board")
    @ResponseBody
    public String syncMyBoard(Authentication authentication, @RequestBody Board board){
        CustomUserDetails principal =
                (CustomUserDetails) authentication.getPrincipal();
        board.setUserId(principal.getUserId());
        updateBoardUseCase.execute(board);
        return "OK";
    }
}
