import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { LogOut, Menu, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../context/MyContext";

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white mx-auto"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    ></path>
  </svg>
);

const Navbar = () => {
  const {
    currentUser,
    setCurrentUser,
    isLoginOpen,
    setIsLoginOpen,
    isRegisterOpen,
    setIsRegisterOpen,
  } = useContext(MyContext);

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // OTP related states
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch {
        sessionStorage.removeItem("token");
      }
    }
  }, [setCurrentUser]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let timer;
    if (resendDisabled && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    if (otpTimer === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, otpTimer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post(
        "https://kaivalyainfotechbackend.onrender.com/api/auth/login",
        loginData,
        { withCredentials: true }
      );
      const token = res.data.token;
      if (token) {
        const decodedUser = jwtDecode(token);
        setCurrentUser(decodedUser);
        sessionStorage.setItem("token", token);
        toast.success(`${decodedUser.name}!`);
        setIsLoginOpen(false);
        setLoginData({ email: "", password: "" });
        navigate(decodedUser.role === "admin" ? "/admin" : "/");
      } else {
        toast.error("Login failed: No token received");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error("Please verify your email before registering.");
      return;
    }
    setRegisterLoading(true);
    try {
      await axios.post(
        "https://kaivalyainfotechbackend.onrender.com/api/auth/register",
        registerData
      );
      toast.success("Registration successful!");
      setIsRegisterOpen(false);
      setRegisterData({ name: "", email: "", password: "" });
      setIsVerified(false);
      setOtp("");
      setOtpTimer(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!registerData.email) {
      toast.error("Please enter your email first.");
      return;
    }
    setSendOtpLoading(true);
    try {
      await axios.post(
        "https://kaivalyainfotechbackend.onrender.com/api/auth/send-otp",
        { email: registerData.email, name: registerData.name }
      );
      toast.success("OTP sent to your email!");
      setResendDisabled(true);
      setOtpTimer(60);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send OTP. Try again."
      );
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }
    setVerifyOtpLoading(true);
    try {
      const res = await axios.post(
        "https://kaivalyainfotechbackend.onrender.com/api/auth/verify-otp",
        { email: registerData.email, otp }
      );
      if (res.data.success) {
        toast.success("Email verified successfully!");
        setIsVerified(true);
        setOtp("");
      } else {
        toast.error("Invalid OTP.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error");
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://kaivalyainfotechbackend.onrender.com/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setCurrentUser(null);
      sessionStorage.removeItem("token");
      toast.success("Logged out successfully.");
      navigate("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const links = [
    "Home",
    "Courses",
    "Certifications",
    "Reviews",
    "Interns",
    "Contact",
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 shadow-md" : "bg-white"
        } dark:bg-gray-800`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div
              onClick={() => navigate("/")}
              className="text-2xl font-extrabold text-main-red hover:text-hover-red cursor-pointer tracking-wide"
            >
              KAIVALYA <span className="font-bold text-black">INFOTECH</span>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex space-x-8">
              {links.map((item, i) => (
                <a
                  key={i}
                  href={item === "Home" ? "/" : `#${item.toLowerCase()}`}
                  className="relative group text-black hover:text-main-red transition dark:text-white"
                >
                  {item}
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-main-red transition-all group-hover:w-full"></span>
                </a>
              ))}
            </div>

            {/* Display logged-in user's name */}
            {currentUser && (
              <div className="hidden md:flex items-center text-black dark:text-white">
                <span className="mr-4">Welcome, {currentUser.name}!</span>
              </div>
            )}

            {/* Desktop Login / Signup */}
            <div className="hidden md:flex space-x-4 items-center">
              {currentUser ? (
                <>
                  {currentUser.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="px-4 py-2 border border-main-red text-main-red rounded hover:bg-main-red-10 transition"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition flex items-center"
                  >
                    <LogOut className="mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-4 py-2 border border-main-red text-main-red rounded hover:bg-main-red-10 transition flex justify-center items-center"
                    disabled={loginLoading}
                  >
                    {loginLoading ? <Spinner /> : "Login"}
                  </button>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-4 py-2 bg-main-red text-white font-semibold rounded hover:bg-hover-red transition flex justify-center items-center"
                    disabled={registerLoading}
                  >
                    {registerLoading ? <Spinner /> : "Sign Up"}
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-black"
                aria-label="Toggle menu"
              >
                {menuOpen ? "" : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`fixed top-0 left-0 bottom-0 z-50 bg-white transition-transform duration-300 transform overflow-y-auto ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } dark:bg-gray-800`}
          style={{
            width: "80vw",
            maxWidth: "400px",
            boxShadow: "4px 0 15px rgba(0,0,0,0.2)",
            borderRight: "1px solid #ddd",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <div className="flex flex-col p-6 h-full">
            <button
              onClick={() => setMenuOpen(false)}
              className="self-end cursor-pointer text-gray-500 text-3xl mb-8"
              aria-label="Close menu"
            >
              <X />
            </button>

            <nav
              className="flex flex-col divide-y divide-gray-200 text-lg font-semibold text-black dark:text-white"
              aria-label="Mobile Primary Navigation"
            >
              {links.map((item, i) => (
                <a
                  key={i}
                  href={item === "Home" ? "/" : `#${item.toLowerCase()}`}
                  className="py-4 px-2 hover:text-main-red transition border-b border-gray-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}

              {!currentUser && (
                <>
                  <a
                    onClick={() => {
                      setIsLoginOpen(true);
                      setMenuOpen(false);
                    }}
                    className="py-4 px-2 cursor-pointer hover:text-main-red transition border-b border-gray-200 rounded"
                  >
                    Login
                  </a>

                  <a
                    onClick={() => {
                      setIsRegisterOpen(true);
                      setMenuOpen(false);
                    }}
                    className="py-4 px-2 cursor-pointer hover:text-main-red transition rounded"
                  >
                    Sign Up
                  </a>
                </>
              )}

              {currentUser && (
                <>
                  {currentUser.role === "admin" && (
                    <a
                      onClick={() => {
                        navigate("/admin");
                        setMenuOpen(false);
                      }}
                      className="py-4 px-2 cursor-pointer hover:text-main-red transition border-b border-gray-200 rounded"
                    >
                      Admin Panel
                    </a>
                  )}

                  <a
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="py-4 px-2 cursor-pointer hover:text-main-red transition rounded"
                  >
                    Logout
                  </a>
                </>
              )}
            </nav>
          </div>
        </div>
      </nav>

      <div className="pt-10 dark:bg-gray-800 " />

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-3 right-4 text-2xl text-gray-500"
              disabled={loginLoading}
              aria-label="Close login modal"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
              Login
            </h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                required
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
                disabled={loginLoading}
                aria-label="Email"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
                disabled={loginLoading}
                aria-label="Password"
              />
              <button
                type="submit"
                className="w-full py-2 bg-main-red text-white rounded hover:bg-hover-red transition flex justify-center items-center cursor-pointer"
                disabled={loginLoading}
              >
                {loginLoading ? <Spinner /> : "Login"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <span
                  onClick={() => {
                    setIsLoginOpen(false);
                    setIsRegisterOpen(true);
                  }}
                  className="text-main-red cursor-pointer"
                >
                  Register here
                </span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => {
                setIsRegisterOpen(false);
                setRegisterData({ name: "", email: "", password: "" });
                setIsVerified(false);
                setOtp("");
                setOtpTimer(0);
                setResendDisabled(false);
              }}
              className="absolute top-3 right-4 text-2xl text-gray-500"
              disabled={registerLoading}
              aria-label="Close register modal"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
              Register
            </h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
                disabled={registerLoading}
                aria-label="Full Name"
              />

              <div className="flex gap-2 items-center">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={registerData.email}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, email: e.target.value });
                    setIsVerified(false);
                    setOtp("");
                    setOtpTimer(0);
                    setResendDisabled(false);
                  }}
                  className="flex-grow px-4 py-2 rounded border bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
                  disabled={registerLoading || sendOtpLoading || isVerified}
                  aria-label="Email"
                />
                {isVerified ? (
                  <span className="text-green-600 font-semibold flex items-center border-green-500 border-2 px-3 py-1 rounded">
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    className={`text-sm px-3 py-1 rounded transition flex justify-center items-center ${
                      resendDisabled
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-main-red text-white hover:bg-hover-red cursor-pointer"
                    }`}
                    onClick={handleSendOtp}
                    disabled={resendDisabled || sendOtpLoading}
                    aria-label="Send OTP"
                  >
                    {sendOtpLoading ? (
                      <Spinner />
                    ) : resendDisabled ? (
                      `Retry in ${otpTimer}s`
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                )}
              </div>

              {!isVerified && otpTimer > 0 && (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
                    disabled={verifyOtpLoading}
                    required
                    aria-label="OTP"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyOtpLoading || otp.length === 0}
                    className="w-full py-2 bg-main-red text-white rounded hover:bg-hover-red transition flex justify-center items-center cursor-pointer"
                    aria-label="Verify OTP"
                  >
                    {verifyOtpLoading ? <Spinner /> : "Verify OTP"}
                  </button>
                </>
              )}

              <input
                type="password"
                placeholder="Password"
                required
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
                disabled={registerLoading}
                aria-label="Password"
              />
              <button
                type="submit"
                disabled={!isVerified || registerLoading}
                className={`w-full py-2 text-white rounded transition flex justify-center items-center ${
                  isVerified
                    ? "bg-main-red hover:bg-hover-red cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                aria-disabled={!isVerified || registerLoading}
              >
                {registerLoading ? <Spinner /> : "Register"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setIsRegisterOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="text-main-red cursor-pointer"
                >
                  Login here
                </span>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
