import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch posts from server.');
        setLoading(false);
      });
  }, []);

  const fetchPostDetail = (slug) => {
    fetch(`http://localhost:5000/posts/${slug}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer secret-token-123',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized or Post not found');
        }
        return res.json();
      })
      .then((data) => setSelectedPost(data))
      .catch((err) => alert(err.message));
  };

  if (loading) return <div className="loading-state">Loading blogs...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Blog Dashboard</h1>
      
      <div className="dashboard-grid">
        
        {/* Left Side: List of All Posts */}
        <div className="posts-section">
          <h2>All Posts (/posts)</h2>
          <div>
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <button 
                  onClick={() => fetchPostDetail(post.slug)}
                  className="btn-read"
                >
                  Read Full Post
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Single Post View */}
        <div className="detail-section">
          <h2>Single Post Detail (/posts/:slug)</h2>
          {selectedPost ? (
            <div className="post-detail-card">
              <h3>{selectedPost.title}</h3>
              <p className="post-meta">
                <strong>Status:</strong> {selectedPost.status} &nbsp;|&nbsp; 
                <strong>Created:</strong> {new Date(selectedPost.created).toLocaleDateString()}
              </p>
              <p className="post-description">{selectedPost.description}</p>
              <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
              <p className="post-content">{selectedPost.content}</p>
            </div>
          ) : (
            <div className="placeholder-text">
              Click "Read Full Post" on any card to view secure details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;