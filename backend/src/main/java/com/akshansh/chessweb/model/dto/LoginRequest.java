package com.akshansh.chessweb.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    @Size(max = 100, message = "Email can be max 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(max = 50, message = "Password can be max 50 characters")
    private String password;
}
