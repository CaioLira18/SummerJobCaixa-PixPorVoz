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

    /**
     * Importa o repositório UserRepository para acessar os dados dos usuários no banco de dados
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Importa o PasswordEncoder para codificar as senhas dos usuários antes de armazená-las no banco de dados, garantindo a segurança das informações.
     */
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * O método findAll() retorna uma lista de todos os usuários cadastrados no sistema
     */
    public List<User> findAll() {
        return userRepository.findAll();
    }

    /**
     * O método findById(String id) retorna um Optional contendo o usuário correspondente ao ID fornecido
     */
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Cria um novo usuário com base nos dados fornecidos no DTO (Data Transfer Object) e retorna o usuário criado.
     */
    public User createUser(CreateUserDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        user.setSaldo(dto.getSaldo());
        user.setContactIds(dto.getContactIds());

        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    /**
     * Atualiza um usuário existente com base no ID fornecido e nos dados atualizados no objeto User, retornando um Optional contendo o usuário atualizado.
     */
    public Optional<User> updateItem(String id, User updatedItem) {
        return userRepository.findById(id).map(item -> {
            item.setName(updatedItem.getName());
            item.setSaldo(updatedItem.getSaldo());
            item.setContactIds(updatedItem.getContactIds());
            item.setCpf(updatedItem.getCpf());

            if (updatedItem.getPassword() != null && !updatedItem.getPassword().isEmpty()
                    && !updatedItem.getPassword().startsWith("$2a$")) {
                item.setPassword(passwordEncoder.encode(updatedItem.getPassword()));
            }

            return userRepository.save(item);
        });
    }

    /**
     * Exclui um usuário com base no ID fornecido, retornando true se a exclusão for bem-sucedida ou false se o usuário não for encontrado.
     */
    public boolean deleteUser(String id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            System.out.println("Usuário deletado: " + id);
            return true;
        }).orElse(false);
    }

    /**
     * Retorna um usuário específico com base no CPF fornecido, utilizando o método findByCpf do repositório UserRepository.
     */
    public Optional<User> findByCpf(String cpf) {
        return userRepository.findByCpf(cpf);
    }

    /**
     * Retorna uma lista de usuários com base em uma lista de IDs fornecida, utilizando o método findAllById do repositório 
     * UserRepository para buscar os usuários correspondentes aos IDs fornecidos.
     */
    public List<User> findAllById(List<String> ids) {
        return userRepository.findAllById(ids);
    }
}