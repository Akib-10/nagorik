import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setPageStyles } from "../styles/usePageStyles";
import logo from "../assets/images/logo_for_dark_mode.png";
import { signIn, register } from "../services/authService";
export default function BrowseFeed() {
  useLayoutEffect(() => setPageStyles("app"));

  const navigate = useNavigate();
  const location = useLocation();

  // If another page redirected the user here,
  // return them to that page after signing in.
  const redirectTo = location.state?.from || "/browse_feed";

  const [mode, setMode] = useState("signin");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title =
      mode === "signin" ? "Sign in — নাগরিক" : "Register — নাগরিক";
  }, [mode]);

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const handleSignIn = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    signIn({
      email,
      isAdmin: false,
    });

    navigate(redirectTo, {
      replace: true,
    });
  };

  const handleAdminSignIn = () => {
    if (!email || !password) {
      setError("Enter your email and password, then use Sign in as Admin.");
      return;
    }

    signIn({
      email,
      isAdmin: true,
    });

    navigate(redirectTo, {
      replace: true,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirm) {
      setError("Please fill in every field.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    register({
      name,
      email,
    });

    navigate(redirectTo, {
      replace: true,
    });
  };

  return (
    <div className="signin-layout">
      {/* =================================================
          LEFT INFORMATION PANEL
          ================================================= */}

      <aside className="signin-side">
        <Link to="/browse_feed" className="signin-browse-link">
          Browse without an Account
        </Link>

        <Link to="/">
          <img src={logo} alt="নাগরিক" className="signin-logo" />
        </Link>

        <p className="signin-desc">
          Nagorik is a modern civic-tech platform for reporting, discussing, and
          tracking local community issues. Built as a university project, it
          connects citizens through community engagement and helps prioritize
          issues based on public feedback.
        </p>

        <div className="signin-stats">
          <div className="signin-stat">
            <div className="num">45</div>
            <div className="label">Open</div>
          </div>

          <div className="signin-stat">
            <div className="num">31</div>
            <div className="label">in progress</div>
          </div>

          <div className="signin-stat">
            <div className="num">14</div>
            <div className="label">received</div>
          </div>
        </div>
      </aside>

      {/* =================================================
          RIGHT SIGN-IN PANEL
          ================================================= */}

      <main className="signin-main">
        <div className="signin-card">
          {mode === "signin" ? (
            <>
              <h1>Sign in</h1>

              <p className="signin-sub">
                Sign in to your AUST Placement account
              </p>

              <form onSubmit={handleSignIn}>
                <div className="field">
                  <label htmlFor="email">AUST Email</label>

                  <input
                    id="email"
                    type="email"
                    placeholder="abrar@aust.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="signin-error">{error}</p>}

                <button type="submit" className="signin-btn-primary">
                  Sign in
                </button>

                <button
                  type="button"
                  className="signin-btn-outline"
                  onClick={handleAdminSignIn}
                >
                  Sign in as Admin
                </button>
              </form>

              <p className="signin-switch">
                don&apos;t have an account?
                <button type="button" onClick={() => switchMode("register")}>
                  Register Now
                </button>
              </p>
            </>
          ) : (
            <>
              <h1>Create account</h1>

              <p className="signin-sub">
                Register a new AUST Placement account
              </p>

              <form onSubmit={handleRegister}>
                <div className="field">
                  <label htmlFor="name">Full Name</label>

                  <input
                    id="name"
                    type="text"
                    placeholder="Abrar Hasan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="regEmail">AUST Email</label>

                  <input
                    id="regEmail"
                    type="email"
                    placeholder="abrar@aust.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="regPassword">Password</label>

                  <input
                    id="regPassword"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="confirm">Confirm Password</label>

                  <input
                    id="confirm"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="signin-error">{error}</p>}

                <button type="submit" className="signin-btn-primary">
                  Create account
                </button>
              </form>

              <p className="signin-switch">
                already have an account?
                <button type="button" onClick={() => switchMode("signin")}>
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
