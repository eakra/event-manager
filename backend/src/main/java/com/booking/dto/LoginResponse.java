package com.booking.dto;

public class LoginResponse {
    public String token;
    public String name;
    public String email;
    public String role;

    public LoginResponse(String token, String name, String email, String role) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
    }
}
