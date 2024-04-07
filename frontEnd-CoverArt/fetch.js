let currentPage = 0;

function fetchBooks(page = currentPage) {
  fetch(`http://localhost:8080/books?page=${page}&size=10`)
    .then((response) => response.json())
    .then((data) => {
      const booksContainer = document.getElementById("booksContainer");
      booksContainer.innerHTML = "";

      data.data.forEach((book) => {
        // Accessing the list of books from the 'data' property
        displayBook(book, booksContainer);
      });

      console.log("Total Pages: " + data.totalPages); // Accessing total pages
      console.log("Total Records: " + data.totalRecords); // Accessing total records

      updatePagination(page, data.totalPages);
    });
}

async function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;

  if (title.trim() === "" || author.trim() === "" || year.trim() === "") {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookTitle: title,
        bookAuthor: author,
        bookYear: year,
      }),
    });

    if (response.ok) {
      await fetchBooks();
    } else {
      throw new Error("Failed to add book.");
    }
  } catch (error) {
    console.error("Error adding book:", error);
  }
}

async function deleteBook(id) {
    try {
      const confirmed = confirm("Are you sure you want to delete this book?");
      if (!confirmed) {
        return; 
      }
      await fetch(`http://localhost:8080/delete/${id}`, {
        method: "DELETE",
      });
      await fetchBooks(currentPage);
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  }

async function editBook(id) {
  try {
    // Fetch the details of the book with the given id
    const response = await fetch(`http://localhost:8080/books/${id}`);
    const book = await response.json();

    // Prompt the user to enter updated information
    const updatedTitle = prompt("Enter the updated title:", book.title);
    const updatedAuthor = prompt("Enter the updated author:", book.author);
    const updatedYear = prompt("Enter the updated number of pages:", book.year);

    // Make sure the user entered some information
    if (updatedTitle && updatedAuthor && updatedYear) {
      // Send a PUT request to update the book
      await fetch(`http://localhost:8080/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookTitle: updatedTitle,
          bookAuthor: updatedAuthor,
          bookYear: updatedYear,
        }),
      });

      // Refresh the list of books after updating
      fetchBooks(currentPage);
    } else {
      alert("Please provide valid information for the book.");
    }
  } catch (error) {
    console.error("Error editing book:", error);
    alert("Failed to edit book. Please try again.");
  }
}

function searchBooks() {
  const searchInput = document.getElementById("searchInput").value;
  fetch(`http://localhost:8080/books/${searchInput}`)
    .then((response) => response.json())
    .then((data) => {
      const booksContainer = document.getElementById("singleBooksContainer");
      booksContainer.innerHTML = "";

      // Check if data is an array
      if (Array.isArray(data)) {
        // Iterate over each book in the array
        data.forEach((book) => {
          displayBook(book, booksContainer);
        });
      } else if (typeof data === "object") {
        // If data is a single object, display that book
        displayBook(data, booksContainer);
      } else {
        // Handle unexpected data format
        console.error("Unexpected data format:", data);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      alert("Book Not Found");
    });
}

function displayBook(book, container) {
  const bookElement = document.createElement("div");
  bookElement.innerHTML = `<div class="book">
                        <img class="imgBook" src="assets/no-image.svg" id="imgBook-${book.id}" />
                        <div class="infoBook">
                          <p class="id"><strong>ID:</strong> ${book.id}</p>
                          <p class="txt"><strong>Title:</strong> ${book.bookTitle}</p>
                          <p class="txt"><strong>Author:</strong> ${book.bookAuthor}</p>
                          <p class="txt"><strong>Year:</strong> ${book.bookYear}</p>
                        </div>
                        <p class="bookBtn">
                        <button class="deleteBtn" onclick="deleteBook('${book.id}')"><span class="material-symbols-outlined">delete</span> Delete </button>
                        <button class="editBtn" onclick="editBook('${book.id}')"><span class="material-symbols-outlined">edit</span> Edit </button>
                        </p>
                        <div>`;
  container.appendChild(bookElement);
  getBookCover(book.bookAuthor, book.bookTitle, book.id);
}

function getBookCover(author, title, bookId) {
    // Construct the URL for the Open Library API search endpoint
    const url = `https://openlibrary.org/search.json?author=${encodeURIComponent(
      author
    )}&title=${encodeURIComponent(title)}`;
  
    // Make a GET request to the API
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Check if any documents were found
        if (data.docs && data.docs.length > 0) {
          const firstResult = data.docs[0];
          // Check if cover data exists
          if (firstResult.cover_i) {
            const coverId = firstResult.cover_i;
            const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
            // Set the src attribute of the corresponding image element
            const imgBookElement = document.getElementById(`imgBook-${bookId}`);
            if (imgBookElement) {
              imgBookElement.src = coverUrl;
            } else {
              console.error(`No image element found for book ID: ${bookId}`);
            }
          } else {
            console.log("No cover available for this book.");
          }
        } else {
          console.log("No results found for this query.");
        }
      })
      .catch((error) => {
        console.error("Error fetching data from Open Library API:", error);
      });
  }

function updatePagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  for (let i = 0; i < totalPages; i++) {
    const pageLink = document.createElement("span");
    pageLink.classList.add("spanBtn");
    pageLink.textContent = i + 1;
    if (i === currentPage) {
      pageLink.classList.add("active");
    }
    pageLink.addEventListener("click", () => {
      fetchBooks(i);
      currentPage = i;
    });
    paginationContainer.appendChild(pageLink);
  }
}

// Fetch books when the page loads
fetchBooks();