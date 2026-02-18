package br.com.caixa.pix.voz.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
/**
 * A classe CreateUserDTO é um DTO (Data Transfer Object) que representa os dados necessários para criar um novo usuário, 
 * incluindo nome, senha, email, CPF, saldo e uma lista de IDs de contatos.
 */
public class CreateUserDTO {
    private String name;
    private String password;
    private String email;
    private String cpf;
    private Integer saldo;
    private List<String> contactIds; 
}