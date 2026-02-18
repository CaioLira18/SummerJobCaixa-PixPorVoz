package br.com.caixa.pix.voz.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserDTO {
    private String name;
    private String password;
    private String email;
    private String cpf;
    private Integer saldo;
    private List<String> contactIds; 
}