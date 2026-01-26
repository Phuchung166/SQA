package com.ptit.onlinelearning.filters;


import com.ptit.onlinelearning.component.JwtTokenUtils;
import com.ptit.onlinelearning.config.WebSecurityConfig;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.service.user.IUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    private final JwtTokenUtils jwtTokenUtils;
    private final UserDetailsService userDetailsService;
    private final IUserService userService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull  HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        if(isByPassToken(request)) {
            filterChain.doFilter(request, response); //enable bypass
            return;
        }
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }
        final String token = authHeader.substring(7);
        final String email = jwtTokenUtils.extractEmail(token);
        if (email != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            User userDetails = (User) userService.getUserDetailFromToken(token);
            if(jwtTokenUtils.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        filterChain.doFilter(request, response);

    }

    private boolean isByPassToken(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        for (String pattern : WebSecurityConfig.WHITE_LIST) {
            if (new AntPathMatcher().match(pattern, path)) {
                return true;
            }
        }
        return  false;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        if (method.equals("GET")) {
            // Allow: GET /course-groups (list all - public)
            if (path.matches(".*/course-groups$")) {
                return true;
            }
            // Allow: GET /course-groups/{id} where id is numeric (get by id - public)
            if (path.matches(".*/course-groups/\\d+$")) {
                return true;
            }
            // Block: GET /course-groups/instructor (requires authentication)
            if (path.matches(".*/course-groups/instructor$")) {
                return false;
            }
        }
        
        List<String> publicPaths = PublicEndpoints.ENDPOINTS.getOrDefault(method, List.of());
        for (String pattern : publicPaths) {
            // Skip the course-groups patterns since we handle them above
            if (pattern.contains("/course-groups")) {
                continue;
            }
            if (new AntPathMatcher().match(pattern, path)) {
                return true;
            }
        }
        return isByPassToken(request);
    }
}
