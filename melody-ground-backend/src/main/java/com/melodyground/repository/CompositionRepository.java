package com.melodyground.repository;

import com.melodyground.model.Composition;
import com.melodyground.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompositionRepository extends JpaRepository<Composition, Long> {
    List<Composition> findByUser(User user);
}
