package com.stockvision.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final FirebaseAuthFilter firebaseAuthFilter;

    public SecurityConfig(FirebaseAuthFilter firebaseAuthFilter) { // Inject via constructor
        this.firebaseAuthFilter = firebaseAuthFilter;
    }

    @Bean
    public org.springframework.security.web.SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors()
                .and()
                .csrf(AbstractHttpConfigurer::disable)  // Updated syntax for Spring Security 6.1+
                .addFilterBefore(firebaseAuthFilter, BasicAuthenticationFilter.class)  // Injected Bean
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/stockvision/api/stripe/webhook").permitAll()
                        .requestMatchers("**").permitAll()  // Allow unauthenticated access to auth endpoints
                        .anyRequest().authenticated());              // Protect all other routes

        return http.build();
    }
}
