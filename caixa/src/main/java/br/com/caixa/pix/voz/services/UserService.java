package br.com.caixa.pix.voz.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.caixa.pix.voz.dto.CreateUserDTO;
import br.com.caixa.pix.voz.entities.User;
import br.com.caixa.pix.voz.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public User createUser(CreateUserDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        user.setSaldo(1000);

        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    public Optional<User> updateItem(String id, User updatedItem) {
        return userRepository.findById(id).map(item -> {
            item.setName(updatedItem.getName());
            item.setSaldo(updatedItem.getSaldo());

            if (updatedItem.getPassword() != null && !updatedItem.getPassword().isEmpty()
                    && !updatedItem.getPassword().startsWith("$2a$")) {
                item.setPassword(passwordEncoder.encode(updatedItem.getPassword()));
            }

            return userRepository.save(item);
        });
    }

    public boolean deleteUser(String id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            System.out.println("Usuário deletado: " + id);
            return true;
        }).orElse(false);
    }
}