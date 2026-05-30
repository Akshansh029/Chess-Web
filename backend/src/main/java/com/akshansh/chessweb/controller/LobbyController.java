package com.akshansh.chessweb.controller;

import com.akshansh.chessweb.model.dto.CreateGameReqDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequestMapping("/games")
@RestController
public class LobbyController {

    @PostMapping("/create")
    public ResponseEntity<UUID> createGame(@Valid @RequestBody CreateGameReqDto request){

    }
}
