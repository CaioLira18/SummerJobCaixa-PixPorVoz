package br.com.caixa.pix.voz.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import br.com.caixa.pix.voz.entities.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String password;
    private String cpf;
    private Integer saldo;
    private List<User> contacts;
}