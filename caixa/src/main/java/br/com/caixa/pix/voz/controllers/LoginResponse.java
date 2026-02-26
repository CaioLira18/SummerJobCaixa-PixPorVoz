package br.com.caixa.pix.voz.controllers;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
/**
 * A classe LoginResponse é um DTO (Data Transfer Object) que representa a resposta de login, contendo informações como id, email, name, cpf e saldo do usuário.
 */
public class LoginResponse {
    private String id;
    private String email;
    private String name;
    private String cpf;
    private Integer saldo;

}