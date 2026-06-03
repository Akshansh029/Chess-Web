package com.akshansh.chessweb.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterUserRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    @Size(max = 100, message = "Email can be max 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(max = 50, message = "Password can be max 50 characters")
    private String password;

    @NotBlank(message = "Verification code is required")
    @NotNull
    private String verificationCode;
}
