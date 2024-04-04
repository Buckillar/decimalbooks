package com.decimal.rest.Repo;


import com.decimal.rest.Models.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepo extends JpaRepository<Book, Long> {
}

