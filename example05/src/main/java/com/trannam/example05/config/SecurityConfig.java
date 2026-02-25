package com.trannam.example05.config;

import java.util.List;
import java.util.Arrays; // Thêm import này

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.trannam.example05.security.JWTFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JWTFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                // Cho phép phương thức OPTIONS (Preflight request) đi qua
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                // 🌍 PUBLIC APIs
                .requestMatchers(
                    "/api/login",
                    "/api/register",
                    "/api/public/forgot-password",
                    "/api/public/verify-otp",
                    "/api/public/**",
                    "/error",
                    "/api/public/carts/**",
                    "/api/auth/**",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/images/**"
                ).permitAll()

                // 👑 ADMIN APIs
                .requestMatchers("/api/admin/**")
                    .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                // 👤 USER APIs
                .requestMatchers("/api/carts/**", "/api/users/**")
                    .hasAnyAuthority("USER", "ROLE_USER", "ADMIN", "ROLE_ADMIN")

                // 🔐 Everything else
                .anyRequest().authenticated()
            )

            .exceptionHandling(e -> e.authenticationEntryPoint(
                (req, res, ex) -> {
                    System.out.println("❌ Blocked: " + req.getRequestURI());
                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                }
            ));

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =======================
    // 🔥 CẤU HÌNH CORS CHUẨN (FIX LỖI 100%) 🔥
    // =======================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();

        // 1. Cho phép Credentials (Cookie, Auth Header...)
        c.setAllowCredentials(true);

        // 2. QUAN TRỌNG: Dùng setAllowedOriginPatterns("*") thay vì setAllowedOrigins
        // Cách này chấp nhận mọi IP (localhost, 10.18..., 192.168...)
        c.setAllowedOriginPatterns(List.of("*"));

        // 3. Cho phép tất cả các Method
        c.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 4. Cho phép tất cả các Header
        c.setAllowedHeaders(Arrays.asList("*")); // Chấp nhận mọi header
        // Hoặc liệt kê chi tiết nếu thích: "Authorization", "Content-Type", "Accept", "x-requested-with"

        // 5. Cho phép Frontend đọc được Header trả về (ví dụ token mới)
        c.setExposedHeaders(Arrays.asList("Authorization", "jwt-token"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }
}