import "./Footer.css";
import Link from "next/link";

import ContactForm from "../ContactForm/ContactForm";

const Footer = () => {
  return (
    <>
      <ContactForm />

      <footer>
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-pages">
              <h3 className="footer-pages-title">PAGES</h3>
              <div className="footer-pages-links">
                <Link href="/genesis">ABOUT US</Link>
                <Link href="/wardrobe">PAGE 1</Link>
                <Link href="/lookbook">PAGE 2</Link>
                <Link href="/contact">PAGE 3</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <img src="logo.png" alt="Cleanse" className="footer-logo" />
            <div className="footer-socials">
              <a href="https://www.instagram.com/cleanseayurveda/" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">TWITTER</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FACEBOOK</a>
              <a href="https://www.youtube.com/@cleanseayurveda" target="_blank" rel="noopener noreferrer">YOUTUBE</a>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-legal">
            <p className="footer-copyright">&copy;2026 CLEANSE AYURVEDA . ALL RIGHTS RESERVED</p>
            <div className="footer-legal-links">
              <Link href="/terms">TERMS OF SERVICE</Link>
              <Link href="/privacy">PRIVACY POLICY</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
