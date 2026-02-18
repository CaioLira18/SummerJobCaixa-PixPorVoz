package br.com.caixa.pix.voz.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
/**
 * A classe UserDTO é um DTO (Data Transfer Object) que representa os dados de um usuário, 
 * incluindo id, nome, email, senha, CPF, saldo e uma lista de IDs de contatos.
 */
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String password;
    private String cpf;
    private Integer saldo;
    private List<String> contactIds;
}