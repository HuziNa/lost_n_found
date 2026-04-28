import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-ornament"></div>
      <div className="footer-top">
        <div className="footer-col">
          <div className="footer-logo">The Artisan Bakeries</div>
          <div className="footer-desc">
            A heritage of fine baking, delivering unparalleled taste and elegance
            to your most cherished moments.
          </div>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Shop</div>
          <ul className="footer-links">
            <li><Link to="/home#cakes">Cakes Collection</Link></li>
            <li><a href="#">Pastries & Savories</a></li>
            <li><a href="#">Vouchers</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Support</div>
          <ul className="footer-links">
            <li><Link to="/orders">Track Order</Link></li>
            <li><a href="#">Delivery Info</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQs</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Connect</div>
          <ul className="footer-links">
            <li><a href="#">Instagram @theartisanbakeries</a></li>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Pinterest</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 The Artisan Bakeries. All rights reserved.</div>
      </div>
    </footer>
  );
}
