import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId") || 1; // Assuming userId is stored

      // Add all items to cart via API
      for (const item of cartItems) {
        await axios.post(
          "http://localhost:8080/api/cart",
          {
            userId: parseInt(userId),
            bookId: item.id,
            quantity: item.quantity,
          },
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
      }

      setSuccess("Checkout successful! Redirecting...");
      clearCart();
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="home-container">
        <div className="no-books-container">
          <div className="no-books-icon">🔐</div>
          <h2>Access Restricted</h2>
          <p>Please login to view your cart</p>
          <Link to="/login" className="login-btn-large">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="home-container">
        <div className="no-books-container">
          <div className="no-books-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Start shopping to add items to your cart</p>
          <Link to="/" className="login-btn-large">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="cart-wrapper">
        <h1 className="books-title">🛒 Your Cart</h1>

        {error && (
          <div style={{
            background: "#f8d7da",
            color: "#721c24",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#d4edda",
            color: "#155724",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}>
            {success}
          </div>
        )}

        <div className="cart-container">
          <div className="cart-items">
            {cartItems.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  <img src={item.coverImage} alt={item.title} />
                </div>
                <div className="cart-item-details">
                  <h3>{item.title}</h3>
                  <p className="cart-item-author">by {item.author}</p>
                  <p className="cart-item-price">₹{item.price}</p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={loading}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    disabled={loading}
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.id)}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>₹{getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-item">
              <span>Tax</span>
              <span>₹0.00</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{getTotalPrice().toFixed(2)}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed to Checkout"}
            </button>
            <Link to="/" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
