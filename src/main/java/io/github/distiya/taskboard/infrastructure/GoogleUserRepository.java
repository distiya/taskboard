package io.github.distiya.taskboard.infrastructure;

import io.github.distiya.taskboard.domain.User;
import io.github.distiya.taskboard.domain.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleUserRepository implements UserRepository {

    private final Map<String,User> usersByEmail = new HashMap<>();

    @Override
    public User findByEmail(String email) {
        return usersByEmail.get(email);
    }

    @Override
    public void saveUser(User user) {
        usersByEmail.put(user.getEmail(),user);
    }
}
