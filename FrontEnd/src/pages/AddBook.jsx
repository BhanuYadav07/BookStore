import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

function AddBook() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
  });

  const [cover, setCover] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const coverInputRef = useRef(null);
  const backInputRef = useRef(null);

  const validateFile = (file, fieldName) => {
    if (!file) {
      setError(`${fieldName} is required`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`${fieldName} size exceeds 5MB limit. File size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }

    if (!file.type.startsWith("image/")) {
      setError(`${fieldName} must be an image file`);
      return false;
    }

    return true;
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setError("");
    
    if (file) {
      if (validateFile(file, "Cover image")) {
        setCover(file);
      } else {
        e.target.value = "";
      }
    }
  };

  const handleBackChange = (e) => {
    const file = e.target.files[0];
    setError("");
    
    if (file) {
      if (validateFile(file, "Back image")) {
        setBack(file);
      } else {
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate all fields
    if (!form.title || !form.title.trim()) {
      setError("Please enter book title");
      return;
    }

    if (!form.author || !form.author.trim()) {
      setError("Please enter author name");
      return;
    }

    if (!form.price || form.price <= 0) {
      setError("Please enter valid price");
      return;
    }

    if (!validateFile(cover, "Cover image")) {
      return;
    }

    if (!validateFile(back, "Back image")) {
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("author", form.author.trim());
      data.append("price", parseFloat(form.price));
      data.append("cover", cover);
      data.append("back", back);

      const response = await axios.post(
        "http://localhost:8080/api/books/upload",
        data,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload successful:", response.data);
      setSuccess("✓ Book added successfully! Redirecting...");
      
      // Reset form
      setForm({ title: "", author: "", price: "" });
      setCover(null);
      setBack(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
      if (backInputRef.current) backInputRef.current.value = "";

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Upload error:", err);
      
      if (err.response?.status === 413) {
        setError("File size too large. Please use images smaller than 5MB");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === "Network Error") {
        setError("Network error. Please check your connection and try again");
      } else {
        setError("Failed to add book. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-container">
      <div className="add-book-card">
        <h2>Add New Book</h2>

        {error && (
          <div style={{
            background: "#f8d7da",
            color: "#721c24",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            ✕ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#d4edda",
            color: "#155724",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Book Title</label>
            <input
              id="title"
              placeholder="Enter book title"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              placeholder="Enter author name"
              value={form.author}
              onChange={e => setForm({...form, author: e.target.value})}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              id="price"
              placeholder="Enter price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={e => setForm({...form, price: e.target.value})}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Cover Image <span style={{ color: "#7f8c8d", fontSize: "0.85rem" }}>(Max 5MB)</span></label>
            <div className="file-input-wrapper">
              <input
                id="cover-input"
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                disabled={loading}
              />
              <label htmlFor="cover-input" className="file-input-label">
                {cover ? (
                  <>
                    ✓ {cover.name}
                    <br />
                    <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                      ({(cover.size / 1024).toFixed(2)} KB)
                    </span>
                  </>
                ) : (
                  "📷 Click to upload cover image"
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Back Image <span style={{ color: "#7f8c8d", fontSize: "0.85rem" }}>(Max 5MB)</span></label>
            <div className="file-input-wrapper">
              <input
                id="back-input"
                ref={backInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackChange}
                disabled={loading}
              />
              <label htmlFor="back-input" className="file-input-label">
                {back ? (
                  <>
                    ✓ {back.name}
                    <br />
                    <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                      ({(back.size / 1024).toFixed(2)} KB)
                    </span>
                  </>
                ) : (
                  "📷 Click to upload back image"
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <button type="submit" disabled={loading}>
              {loading ? "⏳ Uploading..." : "✓ Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBook;