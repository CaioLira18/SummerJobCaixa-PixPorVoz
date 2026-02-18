package br.com.caixa.pix.voz.services;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
/**
 * A classe LoginRequest é um DTO (Data Transfer Object) que representa os dados de uma requisição de login,
 */
public class LoginRequest {
    private String email;
    private String password;

}