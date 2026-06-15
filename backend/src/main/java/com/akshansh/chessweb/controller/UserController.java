package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.model.dto.UserDetailsDto;
import com.akshansh.chessweb.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Controller", description = "APIs for user management")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get user details", description = "Fetch details and stats for the current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User details fetched successfully",
                    content = @Content(schema = @Schema(implementation = UserDetailsDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthenticated user",
                    content = @Content(schema = @Schema()))
    })
    @GetMapping("/me")
    public ResponseEntity<UserDetailsDto> fetchActiveUserDetails(){
        UserDetailsDto userDetails = userService.getUserDetails();
        return ResponseEntity.ok(userDetails);
    }
}
