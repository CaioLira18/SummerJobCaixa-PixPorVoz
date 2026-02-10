package br.com.caixa.pix.voz.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.caixa.pix.voz.dto.CreateUserDTO;
import br.com.caixa.pix.voz.dto.UserDTO;
import br.com.caixa.pix.voz.entities.User;
import br.com.caixa.pix.voz.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody CreateUserDTO user) {
        System.out.println("Dados recebidos: " + user.getName() + ", " + user.getEmail());
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateItem(@PathVariable String id, @RequestBody UserDTO userDto) {
        // 1. Procurar o utilizador existente para não perder dados (como a ROLE ou
        // Favoritos)
        return userService.findById(id).map(existingUser -> {

            // 2. Atualizar apenas os campos permitidos vindos do DTO
            existingUser.setName(userDto.getName());
            existingUser.setEmail(userDto.getEmail());

            // Se a password vier preenchida, passamos para o service tratar a criptografia
            if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
                existingUser.setPassword(userDto.getPassword());
            }

            // 3. Chamar o service enviando a entidade já populada
            User updated = userService.updateItem(id, existingUser).orElseThrow();
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        boolean deleted = userService.deleteUser(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}