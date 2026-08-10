package io.github.distiya.taskboard.application;

import io.github.distiya.taskboard.domain.User;
import io.github.distiya.taskboard.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserRepository userRepository;

    public void execute(User user){
        User existingUser = userRepository.findByEmail(user.getEmail());
        if(existingUser != null){
            throw new IllegalArgumentException("There is an existing user with this email");
        }
        userRepository.saveUser(user);
    }

}
