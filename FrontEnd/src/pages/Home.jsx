import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext";

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartNotification, setCartNotification] = useState("");
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchBooks = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/books", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setBooks(res.data);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const token = localStorage.getItem("token");

  // Not logged in
  if (!token) {
    return (
      <div className="home-container">
        <div className="no-books-container">
          <div className="no-books-icon">🔐</div>
          <h2>Access Restricted</h2>
          <p>Please login to view our collection of books</p>
          <Link to="/login" className="login-btn-large">
            Sign In Now
          </Link>
          <p style={{ marginTop: "1.5rem", color: "#7f8c8d" }}>
            Don't have an account? <Link to="/register" style={{ color: "#3498db", textDecoration: "none", fontWeight: "600" }}>Register here</Link>
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">
          <span className="loading-spinner"></span>
          Loading books...
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="home-container">
        <div className="no-books-container">
          <div className="no-books-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button
            className="login-btn-large"
            onClick={() => window.location.reload()}
            style={{ background: "#e74c3c" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No books
  if (books.length === 0) {
    return (
      <div className="home-container">
        <div className="no-books-container">
          <div className="no-books-icon">📚</div>
          <h2>No Books Available</h2>
          <p>Check back soon for new additions to our collection</p>
          <button
            className="login-btn-large"
            onClick={() => window.location.reload()}
            style={{ background: "#27ae60" }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Display books
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="books-title">Our Collection</h1>

        {cartNotification && (
          <div className="cart-notification">
            {cartNotification}
          </div>
        )}

        <div className="books-grid">
          {books.map(book => (
            <div className="book-card" key={book.id}>
              <div className="book-image-container">
                <img src={book.coverImage} alt={book.title} />
              </div>
              <div className="book-content">
                <h3 className="book-title" title={book.title}>{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-price">₹{book.price}</p>
                <div className="book-actions">
                  <button
                    className="book-btn book-btn-primary"
                    onClick={() => {
                      addToCart(book);
                      setCartNotification(`✓ ${book.title} added to cart!`);
                      setTimeout(() => setCartNotification(""), 3000);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button className="book-btn book-btn-secondary">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;