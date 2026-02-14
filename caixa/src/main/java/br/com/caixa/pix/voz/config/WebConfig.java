package br.com.caixa.pix.voz.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Permite qualquer origem (qualquer porta do localhost ou domínio)
        config.setAllowedOriginPatterns(Arrays.asList("*")); 
        
        // Permite credenciais (importante para cookies/auth headers)
        config.setAllowCredentials(true);
        
        // Permite todos os cabeçalhos (Content-Type, Authorization, etc)
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Permite todos os métodos (GET, POST, PUT, DELETE, OPTIONS)
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}