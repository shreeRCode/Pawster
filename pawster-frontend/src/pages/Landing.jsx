import { Link } from "react-router-dom";
import "../styles/landing.css";

function Landing() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="logo-badge">
              <span className="paw-icon">🐾</span>
              <h1 className="brand-logo">Pawster</h1>
            </div>

            <h2 className="hero-title">
              Where Pets Meet
              <br />
              <span className="gradient-text">Their People</span>
            </h2>

            <p className="hero-description">
              Join a loving community of pet parents. Share precious moments,
              discover playmates, and celebrate the joy of your furry friends.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn-primary">
                Get Started Free
                <span className="btn-arrow">→</span>
              </Link>
              <a href="#features" className="btn-secondary">
                Learn More
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Happy Pets</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5K+</span>
                <span className="stat-label">Pet Parents</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Moments Shared</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-image-container">
              <div className="floating-card card-1">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"
                  alt="Cute golden retriever"
                />
                <div className="card-overlay">
                  <span className="card-username">@maxthegolden</span>
                  <span className="card-likes">❤️ 2.3K</span>
                </div>
              </div>

              <div className="floating-card card-2">
                <img
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400"
                  alt="Playful husky"
                />
                <div className="card-overlay">
                  <span className="card-username">@huskylife</span>
                  <span className="card-likes">❤️ 1.8K</span>
                </div>
              </div>

              <div className="floating-card card-3">
                <img
                  src="https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400"
                  alt="Happy beagle"
                />
                <div className="card-overlay">
                  <span className="card-username">@beaglebuddy</span>
                  <span className="card-likes">❤️ 3.1K</span>
                </div>
              </div>

              <div className="glow-effect"></div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll to explore</span>
          <span className="scroll-arrow">↓</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">Everything You Need to Connect</h2>
          <p className="section-description">
            Built for pet lovers, by pet lovers. Share, connect, and celebrate
            together.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Share Moments</h3>
            <p>
              Post adorable photos and videos of your pets. Capture every
              precious moment and share it with the community.
            </p>
          </div>

          <div className="feature-card featured">
            <div className="feature-badge">Most Popular</div>
            <div className="feature-icon">🤝</div>
            <h3>Connect with Pet Parents</h3>
            <p>
              Follow fellow pet owners, make friends, and build a supportive
              community of animal lovers.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Smart Filters</h3>
            <p>
              AI-powered detection ensures only genuine pet content. Keep the
              community authentic and safe.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Engage & Interact</h3>
            <p>
              Like, comment, and connect. Build meaningful relationships through
              your shared love of pets.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Discover Friends</h3>
            <p>
              Find playmates nearby, discover new pet accounts, and grow your
              network organically.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>
              Built with modern technology for a seamless, responsive experience
              across all devices.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Join the Pack?</h2>
          <p className="cta-description">
            Start sharing your pet's journey today. It's free, fun, and filled
            with love.
          </p>
          <Link to="/login" className="btn-cta">
            Sign Up Now
            <span className="btn-sparkle">✨</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-logo">🐾 Pawster</h3>
            <p>Where pets meet their people</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="footer-column">
              <h4>Community</h4>
              <a href="#guidelines">Guidelines</a>
              <a href="#support">Support</a>
              <a href="#blog">Blog</a>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Pawster. Made with ❤️ for pets and their humans.</p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram">
              📷
            </a>
            <a href="#" aria-label="Twitter">
              🐦
            </a>
            <a href="#" aria-label="Facebook">
              👥
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
