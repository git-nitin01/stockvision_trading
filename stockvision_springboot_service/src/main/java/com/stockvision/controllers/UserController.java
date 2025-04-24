package com.stockvision.controllers;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.stockvision.models.User;
import com.stockvision.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173/", "http://localhost:8080/"})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Get user profile
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        return ResponseEntity.ok(user);
    }

    // Update user profile (Firebase + MongoDB)
    @PutMapping("/update")
    public ResponseEntity<?> updateUserProfile(HttpServletRequest request, @RequestBody User updatedUser) {
        String userId = (String) request.getAttribute("userId");
        User existingUser = userRepository.findById(userId).orElse(null);

        if (existingUser == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        try {
            // Update Firebase User Profile (Only if the name has changed)
            if (!existingUser.getName().equals(updatedUser.getName())) {
                UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(userId)
                        .setDisplayName(updatedUser.getName());
                FirebaseAuth.getInstance().updateUser(updateRequest);
            }

            // Prevent email change for Google-authenticated users
            if (existingUser.isSocialLogin() && !existingUser.getEmail().equals(updatedUser.getEmail())) {
                return ResponseEntity.badRequest().body("Cannot change email for Google-authenticated users.");
            }

            // Update MongoDB User
            existingUser.setName(updatedUser.getName());
            userRepository.save(existingUser);

            return ResponseEntity.ok("User profile updated successfully");

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(500).body("Failed to update Firebase: " + e.getMessage());
        }
    }
}
