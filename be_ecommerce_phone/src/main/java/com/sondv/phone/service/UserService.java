package com.sondv.phone.service;

import com.sondv.phone.dto.UserResponseDTO;
import com.sondv.phone.model.User;
import com.sondv.phone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponseDTO getCurrentUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new RuntimeException("Unauthorized access!");
        }

        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        return new UserResponseDTO(
        );
    }
}
