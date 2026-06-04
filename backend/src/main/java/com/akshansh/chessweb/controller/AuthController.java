package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.exception.ResourceNotFoundException;
import com.akshansh.chessweb.model.dto.LoginRequest;
import com.akshansh.chessweb.model.dto.LoginResponse;
import com.akshansh.chessweb.model.dto.RegisterUserRequest;
import com.akshansh.chessweb.model.dto.TokenResponse;
import com.akshansh.chessweb.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


//    @Operation(summary = "Check user's email", description = "Check whether provided email is already registered or not")
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "200", description = "True",
//                    content = @Content(schema = @Schema(implementation = Boolean.class))),
//            @ApiResponse(responseCode = "400", description = "Invalid request body",
//                    content = @Content(schema = @Schema())),
//            @ApiResponse(responseCode = "400", description = "User already exists",
//                    content = @Content(schema = @Schema()))
//    })
    @PostMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(
            @RequestParam @NotBlank @NotNull String email
    ){
        boolean registeredUserResp = authService.checkEmail(email);

        return ResponseEntity.ok(registeredUserResp);
    }


//    @Operation(summary = "Login the user", description = "Sign in the user and generate JWT token")
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "200", description = "Login successfully",
//                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
//            @ApiResponse(responseCode = "400", description = "Invalid request body",
//                    content = @Content(schema = @Schema())),
//    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ){
        TokenResponse loginResp = authService.loginUser(request);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", loginResp.getRefreshToken())
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(30 * 24 * 60 * 60) // 30 days
                        .sameSite("None") // Required as frontend/backend are on different subdomains
                        .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", loginResp.getAccessToken())
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(10 * 60) // 10 minutes
                        .sameSite("None")
                        .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        return ResponseEntity.status(HttpStatus.OK).body(LoginResponse.builder()
                .message(loginResp.getMessage())
                .accessToken(loginResp.getAccessToken())
                .build());
    }

//    @Operation(summary = "Generate new access token", description = "Generate new access token with the help of refresh token")
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "200", description = "Login successfully",
//                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
//            @ApiResponse(responseCode = "400", description = "RefreshToken not found",
//                    content = @Content(schema = @Schema())),
//            @ApiResponse(responseCode = "401", description = "Invalid token",
//                    content = @Content(schema = @Schema())),
//            @ApiResponse(responseCode = "404", description = "User not found",
//                    content = @Content(schema = @Schema())),
//    })
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ){
        if(request.getCookies() == null){
            throw new ResourceNotFoundException("Refresh token not found in cookies");
        }

        String refreshToken = Arrays.stream(request.getCookies()) //getCookies() method returns a array of cookie
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(()-> new AuthenticationServiceException("RefreshToken not found"));
        TokenResponse loginResponseDto = authService.refreshToken(refreshToken);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", loginResponseDto.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(30 * 24 * 60 * 60) // 30 days
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", loginResponseDto.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(10 * 60) // 10 minutes
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        return ResponseEntity.status(HttpStatus.OK).body(
                LoginResponse.builder()
                        .message(loginResponseDto.getMessage())
                        .accessToken(loginResponseDto.getAccessToken())
                        .build()
        );
    }

//    @Operation(summary = "Register the user", description = "Register the user and add details in database")
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "201", description = "User registered successfully",
//                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
//            @ApiResponse(responseCode = "400", description = "Invalid request body",
//                    content = @Content(schema = @Schema())),
//            @ApiResponse(responseCode = "400", description = "User already exists",
//                    content = @Content(schema = @Schema()))
//    })
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> registerAndVerify(
            @Valid @RequestBody RegisterUserRequest request,
            HttpServletResponse response
    ) {
        TokenResponse registerAndVerifyResp = authService.registerAndVerify(request);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", registerAndVerifyResp.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(30 * 24 * 60 * 60) // 30 days
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", registerAndVerifyResp.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(10 * 60) // 10 minutes
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(LoginResponse.builder()
            .message(registerAndVerifyResp.getMessage())
            .accessToken(registerAndVerifyResp.getAccessToken())
            .build());
    }

//    @Operation(summary = "Logout the user", description = "Delete refreshToken from database and clear browser cookies")
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "204", description = "No Content",
//                    content = @Content(schema = @Schema()))
//    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            if (request.getCookies() != null) {
                Arrays.stream(request.getCookies())
                        .filter(cookie -> "refreshToken".equals(cookie.getName()))
                        .findFirst()
                        .map(Cookie::getValue)
                        .ifPresent(authService::logout);
            }
        } catch (Exception e) {
            log.error("event=couldNotClearCookies userId={} requestId={}", MDC.get("userId"), MDC.get("requestId"));
        }

        // Clear refreshToken and accessToken from browser cookies
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        return ResponseEntity.noContent().build();
    }
}
