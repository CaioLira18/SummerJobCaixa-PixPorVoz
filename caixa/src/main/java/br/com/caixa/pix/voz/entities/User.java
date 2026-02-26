package br.com.caixa.pix.voz.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "tb_users")
public class User {
    /**
     * O campo "id" é do tipo String e é gerado automaticamente usando a estratégia UUID, garantindo que cada usuário tenha um identificador único.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * O campo "name" armazena o nome do usuário,
     * o campo "email" armazena o endereço de e-mail do usuário,
     * o campo "password" armazena a senha do usuário,
     * o campo "cpf" armazena o CPF do usuário,
     * o campo "saldo" armazena o saldo do usuário (inicializado com 1000) e o
     * campo "contactIds" é uma lista de strings que armazena os IDs dos contatos do usuário.
     * Além disso, há um relacionamento ManyToMany com a própria entidade User para representar os contatos do usuário.
     */

    private String name;
    private String email;
    private String password;
    private String cpf;
    private Integer saldo = 1000;
    private List<String> contactIds = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "tb_user_contacts", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "contact_id"))
    private List<User> contacts = new ArrayList<>();
}