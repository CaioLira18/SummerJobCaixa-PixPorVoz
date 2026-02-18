package br.com.caixa.pix.voz.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.caixa.pix.voz.entities.User;
import br.com.caixa.pix.voz.repositories.UserRepository;
import br.com.caixa.pix.voz.services.LoginRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    /**
     * Importa o repositório UserRepository para acessar os dados dos usuários no banco de dados, 
     * permitindo a autenticação dos usuários com base em suas credenciais (email ou CPF e senha).
     */
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Importa o PasswordEncoder para comparar a senha fornecida pelo usuário durante o login com a senha armazenada no banco de dados, 
     * garantindo a segurança da autenticação.
     */
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * O método login recebe uma requisição de login contendo o email ou CPF e a senha do usuário,
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        /**
         * Verifica se os campos de email/CPF e senha estão presentes na requisição. 
         */
        try {
            if (loginRequest == null || loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email/CPF e senha são obrigatórios");
            }

            // Tenta encontrar por Email, se não encontrar, tenta por CPF
            Optional<User> optionalUser = userRepository.findByEmail(loginRequest.getEmail());
            if (optionalUser.isEmpty()) {
                optionalUser = userRepository.findByCpf(loginRequest.getEmail());
            }

            /**
             * Verifica se o usuário foi encontrado no banco de dados. Se não for encontrado, 
             * retorna uma resposta de status UNAUTHORIZED com a mensagem "Usuário não encontrado".
             */
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não encontrado");
            }

            /**
             * Compara a senha fornecida na requisição com a senha armazenada no banco de dados usando o PasswordEncoder.
             */
            User user = optionalUser.get();

            /**
             * Se a senha não corresponder, retorna uma resposta de status UNAUTHORIZED com a mensagem "Senha inválida".
             */
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha inválida");
            }

            /**
             * Se a autenticação for bem-sucedida,
             * retorna uma resposta de status OK contendo um objeto
             * LoginResponse com as informações do usuário (id, email, name, cpf e saldo).
             */
            return ResponseEntity.ok(new LoginResponse(
                    user.getId(), user.getEmail(), user.getName(), user.getCpf(), user.getSaldo()
            ));

            /**
             * Se ocorrer qualquer exceção durante o processo de autenticação,
             * captura a exceção, imprime o stack trace e retorna uma resposta de
             * status INTERNAL_SERVER_ERROR com a mensagem "Erro interno no servidor".
             */
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno no servidor");
        }
    }
}