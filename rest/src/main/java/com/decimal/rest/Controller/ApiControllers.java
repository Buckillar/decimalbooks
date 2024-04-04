package com.decimal.rest.Controller;

import com.decimal.rest.Models.Book;
import com.decimal.rest.Repo.BookRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class ApiControllers {
    @Autowired
    private BookRepo bookRepo;

    @GetMapping("/")
    public String getPage() {
        return "Welcome";
    }
/*
    @GetMapping("/books")
    public List<Book> getBooks(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepo.findAll(pageable);
        return bookPage.getContent();
    }
*/

    @GetMapping("/books")
    public PaginationResponse<Book> getBooks(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepo.findAll(pageable);

        PaginationResponse<Book> response = new PaginationResponse<>();
        response.setData(bookPage.getContent());
        response.setTotalPages(bookPage.getTotalPages());
        response.setTotalRecords(bookPage.getTotalElements());

        return response;
    }
    @GetMapping("/books/{id}")
    public Book getBookById(@PathVariable long id) {
        Optional<Book> optionalBook = bookRepo.findById(id);
        return optionalBook.orElse(null); // Return null if the book is not found
    }


    @PostMapping(value = "/save")
    public String saveUser(@RequestBody Book book) {
        bookRepo.save(book);
        String s = "Saved Book...";
        return s;
    }

    @PutMapping(value = "update/{id}")
    public String updateUser(@PathVariable long id, @RequestBody Book book) {
        Book updatedBook = bookRepo.findById(id).get();
        updatedBook.setBookTitle(book.getBookTitle());
        updatedBook.setBookAuthor(book.getBookAuthor());
        updatedBook.setBookYear(book.getBookYear());
        bookRepo.save(updatedBook);
        return "Updated Book...";
    }


    @DeleteMapping(value = "/delete/{id}")
    public String deleteUser(@PathVariable long id) {
        Book deleteBook = bookRepo.findById(id).get();
        bookRepo.delete(deleteBook);
        String s = "Book Deleted...";
        return s;
    }
    class PaginationResponse<T> {
        private List<T> data;
        private int totalPages;
        private long totalRecords;

        // Getters and setters
        public List<T> getData() {
            return data;
        }

        public void setData(List<T> data) {
            this.data = data;
        }

        public int getTotalPages() {
            return totalPages;
        }

        public void setTotalPages(int totalPages) {
            this.totalPages = totalPages;
        }

        public long getTotalRecords() {
            return totalRecords;
        }

        public void setTotalRecords(long totalRecords) {
            this.totalRecords = totalRecords;
        }
    }
}