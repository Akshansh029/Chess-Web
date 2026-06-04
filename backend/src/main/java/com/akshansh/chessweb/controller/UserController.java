package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.model.dto.UserDetailsDto;
import com.akshansh.chessweb.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDetailsDto> fetchActiveUserDetails(){
        UserDetailsDto userDetails = userService.getUserDetails();
        return ResponseEntity.ok(userDetails);
    }
}
