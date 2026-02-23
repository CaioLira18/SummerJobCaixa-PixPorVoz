package br.com.caixa.pix.voz.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.caixa.pix.voz.dto.CreateUserDTO;
import br.com.caixa.pix.voz.dto.UserDTO;
import br.com.caixa.pix.voz.entities.User;
import br.com.caixa.pix.voz.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    /**
     * Importa o serviço UserService para lidar com a lógica de negócios relacionada
     * aos usuários.
     */
    @Autowired
    private UserService userService;

    /**
     * Retorna todos os usuarios cadastrados no sistema.
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    /**
     * Retorna um usuário específico com base no ID fornecido.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria um novo usuário com base nos dados fornecidos no corpo da requisição.
     */
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody CreateUserDTO user) {
        System.out.println("Dados recebidos: " + user.getName() + ", " + user.getEmail());
        return ResponseEntity.ok(userService.createUser(user));
    }

    /**
     * Atualiza um usuário existente com base no ID fornecido e nos dados
     * atualizados no corpo da requisição.
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateItem(
            @PathVariable String id,
            @RequestBody UserDTO userDto) {

        return userService.findById(id).map(existingUser -> {

            if (userDto.getName() != null) {
                existingUser.setName(userDto.getName());
            }

            if (userDto.getEmail() != null) {
                existingUser.setEmail(userDto.getEmail());
            }

            if (userDto.getCpf() != null) {
                existingUser.setCpf(userDto.getCpf());
            }

            if (userDto.getSaldo() != null) {
                existingUser.setSaldo(userDto.getSaldo());
            }

            if (userDto.getContactIds() != null) {
                existingUser.setContactIds(userDto.getContactIds());
            }

            if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
                existingUser.setPassword(userDto.getPassword());
            }

            User updated = userService.updateItem(id, existingUser).orElseThrow();
            return ResponseEntity.ok(updated);

        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Exclui um usuário com base no ID fornecido
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        boolean deleted = userService.deleteUser(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * Retorna um usuário específico com base no CPF fornecido
     */
    @GetMapping("/search/{cpf}")
    public ResponseEntity<User> getUserByCpf(@PathVariable String cpf) {
        return userService.findByCpf(cpf)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retorna uma lista de usuários com base em uma lista de IDs fornecida no corpo
     * da requisição.
     */
    @PostMapping("/list-by-ids")
    public ResponseEntity<List<User>> getUsersByIds(@RequestBody List<String> ids) {
        List<User> users = userService.findAllById(ids);
        return ResponseEntity.ok(users);
    }
}