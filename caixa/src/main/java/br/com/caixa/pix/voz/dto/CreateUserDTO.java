package br.com.caixa.pix.voz.dto;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CreateUserDTO {
    private String name;
    private String password;
    private String email;
    private String saldo;
}