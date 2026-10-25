package com.example.smart_waste_collection.config;

import com.example.smart_waste_collection.service.CustomUserDetailsService;
import com.example.smart_waste_collection.service.JwtService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.List;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http
    .csrf(csrf -> csrf.disable())
    .cors(cors -> {})
            .sessionManagement(session ->
        session.sessionCreationPolicy(
                SessionCreationPolicy.STATELESS
        )
)

.authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
    .requestMatchers("/", "/error").permitAll()
    .requestMatchers("/auth/login", "/auth/register").permitAll()


.requestMatchers(HttpMethod.POST, "/users")
.hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/users")
.hasRole("ADMIN")




.requestMatchers(HttpMethod.GET, "/collection-requests/driver/**")
.hasRole("DRIVER")

.requestMatchers(HttpMethod.PUT, "/collection-requests/*/start")
.hasRole("DRIVER")

.requestMatchers(HttpMethod.PUT, "/collection-requests/*/complete")
.hasRole("DRIVER")

.requestMatchers(HttpMethod.GET, "/collection-requests")
.hasAnyRole("ADMIN", "DISPATCHER")

.requestMatchers(HttpMethod.POST, "/collection-requests/*")
.hasAnyRole("ADMIN", "DISPATCHER", "RESIDENT")

.requestMatchers(HttpMethod.PUT, "/collection-requests/*/status")
.hasRole("DISPATCHER")

    .requestMatchers("/driver-locations/**")
    .hasRole("DRIVER")

  .requestMatchers("/assignments/**")
    .hasRole("DISPATCHER")

  .requestMatchers(
    HttpMethod.POST,
    "/routes/auto-plan"
).hasRole("DISPATCHER")

.requestMatchers("/routes/**")
.hasAnyRole("ADMIN", "DISPATCHER", "DRIVER")

    .requestMatchers("/notifications/**")
.hasAnyRole("ADMIN", "DISPATCHER")

.requestMatchers(HttpMethod.POST, "/bins")
.hasRole("ADMIN")

.requestMatchers("/bins/**")
.hasAnyRole("ADMIN", "DISPATCHER", "DRIVER", "RESIDENT")


.requestMatchers(HttpMethod.POST, "/drivers")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.POST, "/vehicles")
    .hasRole("ADMIN")


    
.requestMatchers(
    HttpMethod.POST,
    "/complaints/*/create-collection-request"
).hasRole("DISPATCHER")



.anyRequest()
.authenticated()
) 

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        return new JwtAuthenticationFilter(
                jwtService,
                userDetailsService
        );
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }


    @Bean
public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();

  configuration.setAllowedOrigins(List.of(
    "http://localhost:5173",
    "https://smart-waste-frontend-vfg3.onrender.com"
));

    configuration.setAllowedMethods(
            List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
    );

    configuration.setAllowedHeaders(
            List.of("*")
    );

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", configuration);

    return source;
}
}
