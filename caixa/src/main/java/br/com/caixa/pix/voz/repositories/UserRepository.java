package br.com.caixa.pix.voz.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.caixa.pix.voz.entities.User;

public interface UserRepository extends JpaRepository<User, String> {
    
}
