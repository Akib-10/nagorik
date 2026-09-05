import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import logo from "../assets/images/logo_for_dark_mode.png";
import signInBg from "../assets/images/sign-in-background.png";
import { signIn, register } from "../services/authService";

export default function BrowseFeed() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/browse_feed";
  const [mode, setMode] = useState(location.state?.mode || "signin");

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
    signIn({ email, isAdmin: false });
    navigate(redirectTo, { replace: true });
  };

  const handleAdminSignIn = () => {
    if (!email || !password) {
      setError("Enter your email and password, then use Sign in as Admin.");
      return;
    }
    signIn({ email, isAdmin: true });
    navigate(redirectTo, { replace: true });
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
    register({ name, email });
    navigate("/browse_feed", { replace: true });
  };

  return (
    <div
      className={clsx(
        "grid",
        "min-h-screen",
        "w-full",
        "grid-cols-[40%_60%]",
        "bg-white",
        "max-[900px]:grid-cols-1",
        "dark:bg-[#161010]"
      )}
    >
      {/* ============ LEFT INFORMATION PANEL ============ */}
      <aside
        className={clsx(
          "relative",
          "flex",
          "min-h-screen",
          "flex-col",
          "items-center",
          "overflow-hidden",
          "bg-nagorik-dark-login-side",
          "px-[70px]",
          "pb-[42px]",
          "max-[900px]:min-h-auto",
          "max-[900px]:px-[30px]",
          "max-[900px]:pt-[50px]",
          "max-[900px]:pb-10",
          "max-[600px]:px-5",
          "dark:bg-[#1F1715]"
        )}
      >
        <Link
          to="/browse_feed"
          className={clsx(
            "signin-browse-link",
            "mt-[90px]",
            "inline-flex",
            "items-center",
            "gap-2",
            "font-['Arial',sans-serif]",
            "text-[12px]",
            "font-bold",
            "uppercase",
            "tracking-[0.14em]",
            "text-nagorik-red",
            "transition-colors",
            "duration-150",
            "hover:text-nagorik-hover-red"
          )}
        >
          Browse without an Account
        </Link>

        <Link to="/">
          <img
            src={logo}
            alt="নাগরিক"
            className={clsx(
              "mx-auto",
              "mb-[105px]",
              "mt-[60px]",
              "block",
              "h-auto",
              "max-h-[100px]",
              "w-[250px]",
              "object-contain",
              "object-center",
              "max-[900px]:mb-[35px]",
              "max-[900px]:mt-5",
              "max-[600px]:w-[160px]"
            )}
          />
        </Link>

        <p
          className={clsx(
            "signin-desc",
            "mx-auto",
            "mt-[-75px]",
            "w-full",
            "max-w-[475px]",
            "text-center",
            "font-['Arial',sans-serif]",
            "text-[14px]",
            "font-medium",
            "leading-[1.2]",
            "tracking-[-0.1px]",
            "text-[#151515]",
            "max-[600px]:text-[13px]"
          )}
        >
          Nagorik is a modern civic-tech platform for reporting, discussing, and
          tracking local community issues. Built as a university project, it
          connects citizens through community engagement and helps prioritize
          issues based on public feedback.
        </p>

        <div
          className={clsx(
            "mt-auto",
            "grid",
            "w-[110%]",
            "max-w-[500px]",
            "grid-cols-3",
            "items-end",
            "justify-items-center",
            "px-[70px]",
            "pb-[60px]",
            "pt-5",
            "max-[900px]:mt-[45px]"
          )}
        >
          <div className={clsx("flex", "flex-col", "items-center", "justify-end")}>
            <div
              className={clsx(
                "font-['Arial',sans-serif]",
                "text-[31px]",
                "font-bold",
                "leading-none",
                "text-[#CF2633]"
              )}
            >
              45
            </div>
            <div
              className={clsx(
                "mt-[3px]",
                "font-['Arial',sans-serif]",
                "text-[9px]",
                "leading-[1.1]",
                "text-[#111]",
                "dark:text-[#B5A59F]"
              )}
            >
              Open
            </div>
          </div>
          <div className={clsx("flex", "flex-col", "items-center", "justify-end")}>
            <div
              className={clsx(
                "font-['Arial',sans-serif]",
                "text-[31px]",
                "font-bold",
                "leading-none",
                "text-[#CF2633]"
              )}
            >
              31
            </div>
            <div
              className={clsx(
                "mt-[3px]",
                "font-['Arial',sans-serif]",
                "text-[9px]",
                "leading-[1.1]",
                "text-[#111]",
                "dark:text-[#B5A59F]"
              )}
            >
              in progress
            </div>
          </div>
          <div className={clsx("flex", "flex-col", "items-center", "justify-end")}>
            <div
              className={clsx(
                "font-['Arial',sans-serif]",
                "text-[31px]",
                "font-bold",
                "leading-none",
                "text-[#CF2633]"
              )}
            >
              14
            </div>
            <div
              className={clsx(
                "mt-[3px]",
                "font-['Arial',sans-serif]",
                "text-[9px]",
                "leading-[1.1]",
                "text-[#111]",
                "dark:text-[#B5A59F]"
              )}
            >
              received
            </div>
          </div>
        </div>
      </aside>

      {/* ============ RIGHT SIGN-IN PANEL ============ */}
      <main
        /* right panel background properties */

        //right panel background
        className={clsx(
          "relative",
          "flex",
          "min-h-screen",
          "items-center",
          "justify-center",
          "overflow-hidden",
          "bg-white",
          "max-[900px]:min-h-0",
          "max-[900px]:py-10",
          "max-[900px]:px-5",
          "dark:bg-[#161010]"
        )}
        style={{
          backgroundImage: `url(${signInBg})`,
          backgroundPosition: "center bottom",
          backgroundSize: "160% auto",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          //white card
          className={clsx(
            "relative",
            "z-[2]",
            "w-[450px]",
            "max-w-[calc(100%-40px)]",
            "rounded-[18px]",
            "bg-white/95",
            "px-[35px]",
            "pt-6",
            "pb-7",
            "shadow-[0_10px_35px_rgba(60,30,30,0.08)]",
            "max-[600px]:px-6",
            "max-[600px]:py-[27px]",
            "max-[600px]:pb-[35px]",
            "dark:bg-[rgba(33,26,25,0.95)]"
          )}
        >
          {mode === "signin" ? (
            <>
              <h1
                //"sign in" Heading
                className={clsx(
                  "mb-[5px]",
                  "pb-[20px]",
                  "font-['Arial',sans-serif]",
                  "text-[32px]",
                  "font-bold",
                  "leading-[1.15]",
                  "text-[#080808]",
                  "max-[600px]:text-[28px]",
                  "dark:text-[#F3EBE8]"
                )}
              >
                Sign in
              </h1>

              <form onSubmit={handleSignIn}>
                <div className={clsx("mb-3.5")}>
                  <label
                    htmlFor="email"
                    className={clsx(
                      "mb-[5px]",
                      "block",
                      "font-['Arial',sans-serif]",
                      "text-[14px]",
                      "font-medium",
                      "text-[#111]",
                      "dark:text-[#B5A59F]"
                    )}
                  >
                    Email:
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={clsx(
                      "h-9",
                      "w-full",
                      "rounded-[10px]",
                      "border",
                      "border-[#D7DEDE]",
                      "bg-white",
                      "px-3.5",
                      "font-['Arial',sans-serif]",
                      "text-sm",
                      "text-[#111]",
                      "outline-none",
                      "focus:border-nagorik-red",
                      "focus:shadow-[0_0_0_2px_rgba(200,16,46,0.08)]",
                      "placeholder:text-[#222]",
                      "placeholder:opacity-100",
                      "dark:border-[#392D2A]",
                      "dark:bg-[#2B2220]",
                      "dark:text-[#EAE0DC]",
                      "dark:placeholder:text-[#8D7E79]"
                    )}
                  />
                </div>

                <div className={clsx("mb-3.5")}>
                  <label
                    htmlFor="password"
                    //password text
                    className={clsx(
                      "mb-[5px]",
                      "block",
                      "font-['Arial',sans-serif]",
                      "text-[14px]",
                      "font-medium",
                      "text-[#111]",
                      "dark:text-[#B5A59F]"
                    )}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={clsx(
                      "h-9",
                      "w-full",
                      "rounded-[10px]",
                      "border",
                      "border-[#D7DEDE]",
                      "bg-white",
                      "px-3.5",
                      "font-['Arial',sans-serif]",
                      "text-sm",
                      "text-[#111]",
                      "outline-none",
                      "focus:border-nagorik-red",
                      "focus:shadow-[0_0_0_2px_rgba(200,16,46,0.08)]",
                      "placeholder:text-[#222]",
                      "placeholder:opacity-100",
                      "dark:border-[#392D2A]",
                      "dark:bg-[#2B2220]",
                      "dark:text-[#EAE0DC]",
                      "dark:placeholder:text-[#8D7E79]"
                    )}
                  />
                </div>

                {error && (
                  <p
                    className={clsx(
                      "mb-3.5",
                      "mt-[-5px]",
                      "text-[12px]",
                      "font-semibold",
                      "text-nagorik-red"
                    )}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className={clsx(
                    //sign in button
                    "signin-btn-primary",
                    "mt-[15px]",
                    "h-[51px]",
                    "w-full",
                    "rounded-[9px]",
                    "bg-nagorik-red",
                    "font-['Arial',sans-serif]",
                    "text-[17px]",
                    "font-bold",
                    "text-white",
                    "transition-colors",
                    "duration-150",
                    "hover:bg-nagorik-hover-red"
                  )}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  className={clsx(
                    //admin button
                    "signin-btn-outline",
                    "mt-[17px]",
                    "h-[52px]",
                    "w-full",
                    "rounded-[9px]",
                    "border-2",
                    "border-nagorik-red",
                    "bg-white",
                    "font-['Arial',sans-serif]",
                    "text-[16px]",
                    "font-semibold",
                    "text-nagorik-red",
                    "transition-[background_0.15s_ease,color_0.15s_ease]",
                    "hover:bg-nagorik-red",
                    "hover:text-white"
                  )}
                  onClick={handleAdminSignIn}
                >
                  Sign in as Admin
                </button>
              </form>

              <p
                className={clsx(
                  // "don't have an account?" text
                  "signin-switch",
                  "pt-3",
                  "text-center",
                  "font-['Arial',sans-serif]",
                  "text-[13px]",
                  "text-[#111]"
                )}
              >
                don't have an account?
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={clsx(
                    "ml-1",
                    "bg-transparent",
                    "font-['Arial',sans-serif]",
                    "text-[13px]",
                    "font-bold",
                    "text-[#111]",
                    "hover:text-nagorik-red"
                  )}
                >
                  Register Now
                </button>
              </p>
            </>
          ) : (
            <>
              <h1
                //"create account" Heading
                className={clsx(
                  "mb-[5px]",
                  "pb-[20px]",
                  "font-['Arial',sans-serif]",
                  "text-[32px]",
                  "font-bold",
                  "leading-[1.15]",
                  "text-[#080808]",
                  "max-[600px]:text-[28px]",
                  "dark:text-[#F3EBE8]"
                )}
              >
                Create account
              </h1>

              <form onSubmit={handleRegister}>
                <div className={clsx("mb-3.5")}>
                  <label
                    htmlFor="name"
                    //full name text
                    className={clsx(
                      "mb-[5px]",
                      "block",
                      "font-['Arial',sans-serif]",
                      "text-[14px]",
                      "font-medium",
                      "text-[#111]",
                      "dark:text-[#B5A59F]"
                    )}
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Abrar Hasan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={clsx(
                      "h-9",
                      "w-full",
                      "rounded-[10px]",
                      "border",
                      "border-[#D7DEDE]",
                      "bg-white",
                      "px-3.5",
                      "font-['Arial',sans-serif]",
                      "text-sm",
                      "text-[#111]",
                      "outline-none",
                      "focus:border-nagorik-red",
                      "focus:shadow-[0_0_0_2px_rgba(200,16,46,0.08)]",
                      "placeholder:text-[#222]",
                      "placeholder:opacity-100",
                      "dark:border-[#392D2A]",
                      "dark:bg-[#2B2220]",
                      "dark:text-[#EAE0DC]",
                      "dark:placeholder:text-[#8D7E79]"
                    )}
                  />
                </div>

                <div className={clsx("mb-3.5")}>
                  <label
                    htmlFor="regEmail"
                    className={clsx(
                      "mb-[5px]",
                      "block",
                      "font-['Arial',sans-serif]",
                      "text-[14px]",
                      "font-medium",
                      "text-[#111]",
                      "dark:text-[#B5A59F]"
                    )}
                  >
                    Email:
                  </label>
                  <input
                    id="regEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={clsx(
                      "h-9",
                      "w-full",
                      "rounded-[10px]",
                      "border",
                      "border-[#D7DEDE]",
                      "bg-white",
                      "px-3.5",
                      "font-['Arial',sans-serif]",
                      "text-sm",
                      "text-[#111]",
                      "outline-none",
                      "focus:border-nagorik-red",
                      "focus:shadow-[0_0_0_2px_rgba(200,16,46,0.08)]",
                      "placeholder:text-[#222]",
                      "placeholder:opacity-100",
                      "dark:border-[#392D2A]",
                      "dark:bg-[#2B2220]",
                      "dark:text-[#EAE0DC]",
                      "dark:placeholder:text-[#8D7E79]"
                    )}
                  />
                </div>

                <div className={clsx("mb-3.5")}>
                  <label
                    htmlFor="regPassword"
                    //password text
                    className={clsx(
                      "mb-[5px]",
                      "block",
                      "font-['Arial',sans-serif]",
                      "text-[14px]",
                      "font-medium",
                      "text-[#111]",
                      "dark:text-[#B5A59F]"
                    )}
                  >
                    Password
                  </label>
                  <input
                    id="regPassword"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={clsx(
                      "h-9",
                      "w-full",
                      "rounded-[10px]",
                      "border",
                      "border-[#D7DEDE]",
                      "bg-white",
                      "px-3.5",
                      "font-['Arial',sans-serif]",
                      "text-sm",
                      "text-[#111]",
                      "outline-none",
                      "focus:border-nagorik-red",
                      "focus:shadow-[0_0_0_2px_rgba(200,16,46,0.08)]",
                      "placeholder:text-[#222]",
                      "placeholder:opacity-100",
                      "dark:border-[#392D2A]",
                      "dark:bg-[#2B2220]",
                      "dark:text-[#EAE0DC]",
                      "dark:placeholder:text-[#8D7E79]"
                    )}
                  />
                </div>

                <div className={clsx("mb-3.5")}>
                  <label
                    htmlFor="confirm"
                    //confirm password text
                    className={clsx(
                      "mb-[5px]",
                      "block",
                      "font-['Arial',sans-serif]",
                      "text-[14px]",
                      "font-medium",
                      "text-[#111]",
                      "dark:text-[#B5A59F]"
                    )}
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className={clsx(
                      "h-9",
                      "w-full",
                      "rounded-[10px]",
                      "border",
                      "border-[#D7DEDE]",
                      "bg-white",
                      "px-3.5",
                      "font-['Arial',sans-serif]",
                      "text-sm",
                      "text-[#111]",
                      "outline-none",
                      "focus:border-nagorik-red",
                      "focus:shadow-[0_0_0_2px_rgba(200,16,46,0.08)]",
                      "placeholder:text-[#222]",
                      "placeholder:opacity-100",
                      "dark:border-[#392D2A]",
                      "dark:bg-[#2B2220]",
                      "dark:text-[#EAE0DC]",
                      "dark:placeholder:text-[#8D7E79]"
                    )}
                  />
                </div>

                {error && (
                  <p
                    className={clsx(
                      "mb-3.5",
                      "mt-[-5px]",
                      "text-[12px]",
                      "font-semibold",
                      "text-nagorik-red"
                    )}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className={clsx(
                    //create account button
                    "signin-btn-primary",
                    "mt-[15px]",
                    "h-[51px]",
                    "w-full",
                    "rounded-[9px]",
                    "bg-nagorik-red",
                    "font-['Arial',sans-serif]",
                    "text-[17px]",
                    "font-bold",
                    "text-white",
                    "transition-colors",
                    "duration-150",
                    "hover:bg-nagorik-hover-red"
                  )}
                >
                  Create account
                </button>
              </form>

              <p
                className={clsx(
                  // "already have an account?" text
                  "signin-switch",
                  "pt-3",
                  "text-center",
                  "font-['Arial',sans-serif]",
                  "text-[13px]",
                  "text-[#111]"
                )}
              >
                already have an account?
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={clsx(
                    "ml-1",
                    "bg-transparent",
                    "font-['Arial',sans-serif]",
                    "text-[13px]",
                    "font-bold",
                    "text-[#111]",
                    "hover:text-nagorik-red"
                  )}
                >
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