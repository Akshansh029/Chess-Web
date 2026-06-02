package com.akshansh.chessweb.repository;

import com.akshansh.chessweb.model.entity.MoveRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MoveRepository extends JpaRepository<MoveRecord, Long> {
}
