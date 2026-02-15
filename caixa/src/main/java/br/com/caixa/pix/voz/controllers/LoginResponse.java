package br.com.caixa.pix.voz.controllers;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LoginResponse {
    private String id;
    private String email;
    private String name;
    private String cpf;
    private Integer saldo;

}