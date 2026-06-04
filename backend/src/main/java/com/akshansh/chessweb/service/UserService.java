package com.akshansh.chessweb.service;

import com.akshansh.chessweb.model.dto.UserDetailsDto;
import com.akshansh.chessweb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.util.UUID;

import static com.akshansh.chessweb.utils.UserUtil.getCurrentUser;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;

    public UserDetailsDto getUserDetails(){
        UUID currentUserId = getCurrentUser().getUserId();

        UserDetailsDto userDetails = userRepo.fetchUserDetails(currentUserId);

        log.info("event=fetchedUserDetails userId={}", MDC.get("userId"));
        return userDetails;
    }
}
