"use client";
import "./profile.css";
import { useState } from "react";
import Link from "next/link";
import Copy from "@/components/Copy/Copy";

const tabs = ["Orders", "Addresses", "Settings"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Orders");

  return (
    <div className="profile-page">
      {/* Hero */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a8 8 0 0116 0v1" />
            </svg>
          </div>
          <Copy animateOnScroll={false} delay={0.2}>
            <p className="profile-hero-label">Welcome Back</p>
          </Copy>
          <Copy animateOnScroll={false} delay={0.4}>
            <h1 className="profile-hero-heading">Your Profile</h1>
          </Copy>
          <Copy animateOnScroll={false} delay={0.6}>
            <p className="profile-hero-subtitle">Guest</p>
          </Copy>
        </div>
      </section>

      {/* Tabs */}
      <section className="profile-tabs-section">
        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      <section className="profile-tab-content">
        {activeTab === "Orders" && (
          <div className="profile-orders">
            <div className="profile-empty-state">
              <div className="profile-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 10h20" />
                  <path d="M12 4v16" />
                </svg>
              </div>
              <h3 className="profile-empty-title">No Orders Yet</h3>
              <p className="profile-empty-text">Your order history will appear here</p>
              <Link href="/wardrobe" className="profile-action-btn">Start Shopping</Link>
            </div>
          </div>
        )}

        {activeTab === "Addresses" && (
          <div className="profile-addresses">
            <div className="profile-address-card">
              <div className="profile-address-badge">Default</div>
              <h4 className="profile-address-name">Home</h4>
              <p className="profile-address-line">123 Ayurveda Lane</p>
              <p className="profile-address-line">New Delhi, 110001</p>
              <p className="profile-address-line">India</p>
              <p className="profile-address-phone">+91 98765 43210</p>
              <div className="profile-address-actions">
                <button className="profile-address-edit">Edit</button>
                <button className="profile-address-delete">Delete</button>
              </div>
            </div>

            <div className="profile-address-card">
              <h4 className="profile-address-name">Office</h4>
              <p className="profile-address-line">456 Wellness Tower, 5th Floor</p>
              <p className="profile-address-line">Mumbai, 400001</p>
              <p className="profile-address-line">India</p>
              <p className="profile-address-phone">+91 91234 56789</p>
              <div className="profile-address-actions">
                <button className="profile-address-edit">Edit</button>
                <button className="profile-address-delete">Delete</button>
              </div>
            </div>

            <button className="profile-add-address-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Add New Address
            </button>
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="profile-settings">
            <div className="profile-settings-card">
              <h3 className="profile-settings-title">Personal Information</h3>
              <div className="profile-form-group">
                <label className="profile-form-label">Full Name</label>
                <input type="text" className="profile-form-input" placeholder="Enter your name" />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Email</label>
                <input type="email" className="profile-form-input" placeholder="Enter your email" />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Phone</label>
                <input type="tel" className="profile-form-input" placeholder="+91" />
              </div>
              <button className="profile-update-btn">Update Profile</button>
            </div>

            <div className="profile-settings-card">
              <h3 className="profile-settings-title">Preferences</h3>
              <div className="profile-pref-row">
                <div className="profile-pref-info">
                  <p className="profile-pref-name">Order Updates</p>
                  <p className="profile-pref-desc">Receive notifications about your orders</p>
                </div>
                <label className="profile-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="profile-toggle-slider"></span>
                </label>
              </div>
              <div className="profile-pref-row">
                <div className="profile-pref-info">
                  <p className="profile-pref-name">Promotions</p>
                  <p className="profile-pref-desc">Get exclusive deals and offers</p>
                </div>
                <label className="profile-toggle">
                  <input type="checkbox" />
                  <span className="profile-toggle-slider"></span>
                </label>
              </div>
              <div className="profile-pref-row">
                <div className="profile-pref-info">
                  <p className="profile-pref-name">Newsletter</p>
                  <p className="profile-pref-desc">Ayurvedic tips and product updates</p>
                </div>
                <label className="profile-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="profile-toggle-slider"></span>
                </label>
              </div>
            </div>

            <button className="profile-signout-btn">Sign Out</button>
          </div>
        )}
      </section>
    </div>
  );
}
