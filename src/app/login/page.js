"use client";
import "./login.css";
import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { referralApi } from "@/lib/endpoints";
import Logo from "@/components/Logo/Logo";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function Login() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { loginWithPassword, sendOtp, login, register, isAuthenticated } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/profile";

  // Read query params for pre-filling (from checkout redirect)
  const paramTab = searchParams.get("tab");
  const paramEmail = searchParams.get("email") || "";
  const paramPhone = searchParams.get("phone") || "";
  const paramName = searchParams.get("name") || "";
  const paramRef = searchParams.get("ref") || "";

  const [activeTab, setActiveTab] = useState(paramTab === "register" ? "register" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Mobile: keep the focused input visible above the on-screen keyboard.
  useEffect(() => {
    const onFocusIn = (e) => {
      if (e.target && e.target.tagName === "INPUT") {
        setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 280);
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  // Login form state
  const [loginMethod, setLoginMethod] = useState("mobile"); // "password" | "mobile"

  // Heading flicker on tab switch — the SplitText char effect from the testimonial review text.
  const welcomeRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = welcomeRef.current;
    if (!el) return;
    const targets = el.querySelectorAll(".login-mobile-title, .login-mobile-sub");
    if (!targets.length) return;
    const split = SplitText.create(targets, { type: "chars" });
    gsap.fromTo(
      split.chars,
      { opacity: 0 },
      { opacity: 1, duration: 0.05, delay: 0.05, stagger: { amount: 0.5, each: 0.1, from: "random" }, ease: "power2.inOut" }
    );
    return () => { try { split.revert(); } catch (e) {} };
  }, [activeTab, loginMethod]);

  // Smooth crossfade when switching login <-> register (mobile only; desktop stays instant).
  const [switching, setSwitching] = useState(false);
  const goTab = (tab) => {
    if (tab === activeTab) return;
    setSwitching(true);
    setTimeout(() => {
      setActiveTab(tab);
      setError("");
      requestAnimationFrame(() => setSwitching(false));
    }, 200);
  };

  // Same smooth crossfade when switching login method (phone OTP <-> email).
  const goMethod = (method) => {
    if (method === loginMethod) return;
    setSwitching(true);
    setTimeout(() => {
      setLoginMethod(method);
      setError(""); setOtpSent(false); setOtp("");
      requestAnimationFrame(() => setSwitching(false));
    }, 200);
  };
  const [loginEmail, setLoginEmail] = useState(paramEmail);
  const [loginPassword, setLoginPassword] = useState("");
  // Mobile OTP login state
  const [loginPhone, setLoginPhone] = useState(paramPhone);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Register form state
  const [regName, setRegName] = useState(paramName);
  const [regEmail, setRegEmail] = useState(paramEmail);
  const [regPhone, setRegPhone] = useState(paramPhone);
  const [regPassword, setRegPassword] = useState("");
  const [regReferralCode, setRegReferralCode] = useState(paramRef.toUpperCase());
  const [referralStatus, setReferralStatus] = useState(null); // null | "checking" | "valid" | "invalid"
  const [referralInfo, setReferralInfo] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) router.replace(redirectTo);
  }, [isAuthenticated, router, redirectTo]);

  // Switch to register tab automatically if a referral code is in the URL
  useEffect(() => {
    if (paramRef) {
      setActiveTab("register");
    }
  }, [paramRef]);

  // Debounced referral code validation
  useEffect(() => {
    if (!regReferralCode || regReferralCode.length < 4) {
      setReferralStatus(null);
      setReferralInfo(null);
      return;
    }
    setReferralStatus("checking");
    const t = setTimeout(async () => {
      try {
        const data = await referralApi.validate(regReferralCode.trim().toUpperCase());
        if (data.valid) {
          setReferralStatus("valid");
          setReferralInfo(data);
        } else {
          setReferralStatus("invalid");
          setReferralInfo(null);
        }
      } catch {
        setReferralStatus("invalid");
        setReferralInfo(null);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [regReferralCode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginWithPassword(loginEmail.trim(), loginPassword);
      router.replace(redirectTo);
    } catch (err) {
      console.error("[login] error:", err.response?.status, err.response?.data);
      const data = err.response?.data;
      const msg = data?.errors?.[0]?.message || data?.message || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const phone = loginPhone.trim();
    if (!phone) {
      setError("Please enter your mobile number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendOtp(phone);
      setOtpSent(true);
      toast.success("OTP sent to your mobile number");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || "Couldn't send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the OTP sent to your mobile");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(loginPhone.trim(), otp.trim());
      router.replace(redirectTo);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await register({
        fullName: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        referralCode: regReferralCode.trim().toUpperCase() || undefined,
      });

      // Surface referral apply outcome to the user
      if (regReferralCode.trim()) {
        if (result?.referralApplied?.success) {
          toast.success("Welcome bonus applied from referral code!");
        } else if (result?.referralApplied?.message) {
          toast.error(`Referral code: ${result.referralApplied.message}`);
        }
      }

      router.replace(redirectTo);
    } catch (err) {
      console.error("[register] error:", err.response?.status, err.response?.data);
      const data = err.response?.data;
      // Show first validation error if available, otherwise the top-level message
      const msg = data?.errors?.[0]?.message || data?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Visual Panel */}
      <div className="login-visual">
        <div className="login-visual-bg">
          <img src="/images/b1.png" alt="" />
        </div>
        <div className="login-visual-overlay"></div>
        <div className="login-visual-content">
          <Link href="/" className="login-visual-logo">
            <Logo src="/logo.png" alt="Cleanse Ayurveda" className="login-logo-mark" />
          </Link>
          <div className="login-visual-text">
            <h2 className="login-visual-heading">Welcome to Cleanse Ayurveda</h2>
            <p className="login-visual-subtitle">Ancient wisdom for modern beauty</p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className={`login-form-container${activeTab === "register" ? " is-register" : ""}`}>
        <Link href="/" className="login-back-arrow" aria-label="Back to home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className={`login-form-inner${switching ? " is-switching" : ""}`}>
          {/* Mobile-only brand header + welcome (desktop uses the left visual panel) */}
          <div className="login-mobile-brand">
            <Link href="/" className="login-mobile-logo" aria-label="Cleanse Ayurveda home">
              <Logo src="/logo.png" alt="Cleanse Ayurveda" className="login-logo-mark" />
            </Link>
          </div>
          <div className="login-mobile-welcome" ref={welcomeRef}>
            <h1 className="login-mobile-title">{activeTab === "login" ? "Welcome Back!" : "Create Account"}</h1>
            <p className="login-mobile-sub">{activeTab === "login" ? "Ready to glow? Log in now!" : "Sign up and improve your health today"}</p>
          </div>

          {/* Error message */}
          {error && <p style={{ color: "#c44", fontSize: "0.9rem", marginBottom: "1rem", textAlign: "center" }}>{error}</p>}

          {/* Tab Toggle */}
          <div className="login-tab-toggle">
            <button
              className={`login-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => goTab("login")}
            >
              Login
            </button>
            <button
              className={`login-tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => goTab("register")}
            >
              Register
            </button>
          </div>

          {/* Login Tab */}
          {activeTab === "login" && (
            <>
              {/* Login method: email+password or mobile OTP */}
              <div className="login-method-toggle">
                <button
                  type="button"
                  className={`login-method-btn ${loginMethod === "password" ? "active" : ""}`}
                  onClick={() => { setLoginMethod("password"); setError(""); }}
                >
                  Email &amp; Password
                </button>
                <button
                  type="button"
                  className={`login-method-btn ${loginMethod === "mobile" ? "active" : ""}`}
                  onClick={() => { setLoginMethod("mobile"); setError(""); setOtpSent(false); setOtp(""); }}
                >
                  Mobile OTP
                </button>
              </div>

              {loginMethod === "password" ? (
                <form className="login-form" onSubmit={handleLogin}>
                  <div className="login-input-group">
                    <label>Email</label>
                    <input type="email" placeholder="Enter your email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={loading} />
                  </div>
                  <div className="login-input-group">
                    <label>Password</label>
                    <div className="login-password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="login-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                            <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="login-options-row">
                    <label className="login-checkbox-label">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                      <span className="login-checkbox-custom"></span>
                      <span className="login-checkbox-text">Remember me</span>
                    </label>
                    <Link href="/login" className="login-forgot">Forgot password</Link>
                  </div>
                  <button type="submit" className="login-submit-btn" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>
              ) : (
                <form className="login-form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                  <div className="login-input-group">
                    <label>Mobile Number</label>
                    <div className="login-phone-row">
                      <span className="login-phone-cc">+91</span>
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="Enter your mobile number"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        disabled={loading || otpSent}
                      />
                    </div>
                  </div>
                  {otpSent && (
                    <div className="login-input-group">
                      <label>OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter the OTP sent to your mobile"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        disabled={loading}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="login-switch-btn"
                        style={{ alignSelf: "flex-start", marginTop: "0.4rem" }}
                        onClick={handleSendOtp}
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                  <button type="submit" className="login-submit-btn" disabled={loading}>
                    {loading
                      ? (otpSent ? "Verifying..." : "Sending OTP...")
                      : (otpSent ? "Verify & Login" : "Send OTP")}
                  </button>
                  {otpSent && (
                    <button
                      type="button"
                      className="login-switch-btn"
                      style={{ alignSelf: "center" }}
                      onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                    >
                      Change number
                    </button>
                  )}
                </form>
              )}

              <div className="login-divider">
                <span className="login-divider-line"></span>
                <span className="login-divider-text">or continue with</span>
                <span className="login-divider-line"></span>
              </div>

              {/* Mobile: switch phone-OTP <-> email login (functioning like the Zomato flow) */}
              <button
                type="button"
                className="login-alt-method"
                onClick={() => goMethod(loginMethod === "mobile" ? "password" : "mobile")}
              >
                {loginMethod === "mobile" ? "Continue with Email" : "Continue with Phone"}
              </button>

              <div className="login-social-buttons">
                <button type="button" className="login-social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button type="button" className="login-social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span>Apple</span>
                </button>
                <button type="button" className="login-social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              <p className="login-switch-text">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="login-switch-btn"
                  onClick={() => goTab("register")}
                >
                  Register
                </button>
              </p>
            </>
          )}

          {/* Register Tab */}
          {activeTab === "register" && (
            <form className="login-form" onSubmit={handleRegister}>
              <div className="login-input-group">
                <label>Full Name</label>
                <input type="text" placeholder="Enter your full name" value={regName} onChange={(e) => setRegName(e.target.value)} disabled={loading} />
              </div>
              <div className="login-input-group">
                <label>Email</label>
                <input type="email" placeholder="Enter your email address" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} disabled={loading} />
              </div>
              <div className="login-input-group login-reg-hide">
                <label>Phone Number</label>
                <input type="tel" placeholder="Enter your phone number" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} disabled={loading} />
              </div>
              <div className="login-input-group login-reg-hide">
                <label>Password</label>
                <div className="login-password-wrapper">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="login-input-group login-reg-hide">
                <label>
                  Referral Code <span style={{ opacity: 0.6 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter referral code (if any)"
                  value={regReferralCode}
                  onChange={(e) => setRegReferralCode(e.target.value.toUpperCase())}
                  disabled={loading}
                />
                {referralStatus === "checking" && (
                  <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
                    Checking...
                  </p>
                )}
                {referralStatus === "valid" && referralInfo && (
                  <p style={{ fontSize: "0.75rem", color: "#2e7d32", marginTop: "0.25rem" }}>
                    ✓ Referred by {referralInfo.referrerName}
                    {referralInfo.refereeRewardValue > 0 &&
                      `, you'll get ${referralInfo.refereeRewardValue}${
                        referralInfo.refereeRewardType === "percentage" ? "% off" : ""
                      } as a welcome bonus`}
                  </p>
                )}
                {referralStatus === "invalid" && (
                  <p style={{ fontSize: "0.75rem", color: "#c62828", marginTop: "0.25rem" }}>
                    Invalid referral code
                  </p>
                )}
              </div>

              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={loading}
                />
                <span className="login-checkbox-custom"></span>
                <span className="login-checkbox-text">
                  I agree to the{" "}
                  <Link href="/terms">Terms of Service</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" className="login-submit-btn" disabled={loading || !agreed}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="login-switch-text">
                Already have an account?{" "}
                <button
                  type="button"
                  className="login-switch-btn"
                  onClick={() => goTab("login")}
                >
                  Login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
