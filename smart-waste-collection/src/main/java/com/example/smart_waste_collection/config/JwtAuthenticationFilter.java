package com.example.smart_waste_collection.config;

import com.example.smart_waste_collection.service.CustomUserDetailsService;
import com.example.smart_waste_collection.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

       String token =
        authHeader.substring(7);

System.out.println("========== JWT DEBUG ==========");
System.out.println("Request: " + request.getRequestURI());
System.out.println("JWT RECEIVED: YES");

boolean valid = jwtService.validateToken(token);

System.out.println("JWT VALID: " + valid);

if (!valid) {

    System.out.println("JWT REJECTED");
    filterChain.doFilter(request, response);
    return;
}

String email =
        jwtService.extractUsername(token);

System.out.println("JWT EMAIL: " + email);

if (SecurityContextHolder
        .getContext()
        .getAuthentication() == null) {

    UserDetails userDetails =
            userDetailsService
                    .loadUserByUsername(email);

    UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

    authentication.setDetails(
            new WebAuthenticationDetailsSource()
                    .buildDetails(request)
    );

    SecurityContextHolder
            .getContext()
            .setAuthentication(authentication);

    System.out.println("AUTHENTICATION SET");
    System.out.println("AUTHORITIES: "
            + userDetails.getAuthorities());
    
}
System.out.println("==============================");
filterChain.doFilter(request, response);
    }
}