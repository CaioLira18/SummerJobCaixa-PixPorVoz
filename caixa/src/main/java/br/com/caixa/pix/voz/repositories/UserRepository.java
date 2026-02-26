package br.com.caixa.pix.voz.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.caixa.pix.voz.entities.User;

public interface UserRepository extends JpaRepository<User, String> {
    /**
     * O método findByEmail(String email) retorna um Optional contendo o usuário correspondente ao email fornecido
     */
    Optional<User> findByEmail(String email);
    /**
     * O método existsByEmail(String email) verifica se um usuário com o email fornecido já existe no banco de dados, retornando true ou false.
     */
    boolean existsByEmail(String email);
    /**
     * O método existsByCpf(String cpf) verifica se um usuário com o CPF fornecido já existe no banco de dados, retornando true ou false.
     */
    boolean existsByCpf(String cpf);
    /**
     * O método findByCpf(String cpf) retorna um Optional contendo o usuário correspondente ao CPF fornecido
     */
    Optional<User> findByCpf(String cpf);
    /**
     * O método findAllById(String ids) retorna um Optional contendo uma lista de usuários correspondentes aos IDs fornecidos, 
     * permitindo a busca de múltiplos usuários por seus IDs.
     */
    Optional<User> findAllById(String ids);

}
