package io.github.distiya.taskboard.domain;

public interface UserRepository {

    User findByEmail(String email);
    void saveUser(User user);

}
