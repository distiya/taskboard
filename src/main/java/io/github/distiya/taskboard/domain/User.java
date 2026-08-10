package io.github.distiya.taskboard.domain;

import lombok.Data;

import java.util.UUID;

@Data
public class User {

    private UUID id;
    private String name;
    private String email;
    private String password;

    public User(String email, String name, String password){
        this.id = UUID.randomUUID();
        this.email = email;
        this.name = name;
        this.password = password;
    }

}
