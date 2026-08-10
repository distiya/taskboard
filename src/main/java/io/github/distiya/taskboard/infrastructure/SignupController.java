package io.github.distiya.taskboard.infrastructure;

import io.github.distiya.taskboard.application.RegisterUseCase;
import io.github.distiya.taskboard.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@RequiredArgsConstructor
public class SignupController {

    private final PasswordEncoder passwordEncoder;
    private final RegisterUseCase registerUseCase;

    @GetMapping("/login")
    public String showLoginForm() {
        return "login";
    }

    @GetMapping("/signup")
    public String showSignupForm(Model model) {
        model.addAttribute("signupDto", new SignUpDTO());
        return "signup"; // Maps to src/main/resources/templates/signup.html
    }

    @PostMapping("/signup")
    public String registerUser(@Valid @ModelAttribute("signupDto") SignUpDTO userInformation, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return "signup";
        }
        String encryptedPassword = passwordEncoder.encode(userInformation.getPassword());
        User user = new User(userInformation.getEmail(),userInformation.getName(),encryptedPassword);
        try{
            registerUseCase.execute(user);
        }
        catch(IllegalArgumentException ex){
            // Add the error specifically to the email field
            bindingResult.addError(
                    new FieldError(
                            "signupDto",
                            "email",
                            userInformation.getEmail(),
                            false,
                            null,
                            null,
                            ex.getMessage()
                    )
            );
            return "signup";
        }
        return "redirect:/login?success";
    }
}
