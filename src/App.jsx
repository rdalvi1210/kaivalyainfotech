import { ArrowUp } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { MyContext } from "./context/MyContext";
import Admin from "./pages/Admin";
import Home from "./pages/Home";

const App = () => {
  const { currentUser, appLoading } = useContext(MyContext);

  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.pageYOffset > 200);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const Spinner = () => (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <svg
        className="animate-spin h-16 w-16 text-gray-900 dark:text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      {appLoading && <Spinner />}

      <Navbar />

      <div>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/admin"
            element={
              !currentUser ? (
                <Navigate to="/" replace />
              ) : currentUser.role !== "admin" ? (
                <Navigate to="/" replace />
              ) : (
                <Admin />
              )
            }
          />
        </Routes>
      </div>

      <Footer />

      {/* Go to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-main-red text-white shadow-lg hover:bg-hover-red transition flex items-center justify-center"
          style={{ width: 44, height: 44 }}
        >
          <ArrowUp size={24} />
        </button>
      )}

      {/* WhatsApp + Contact Buttons Container (vertical stack) */}
      {appLoading ? (
        ""
      ) : (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col space-y-3">
          {/* WhatsApp Icon Button (below) */}
          <a
            href="https://wa.me/918097096461"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="p-3 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition flex items-center justify-center"
            style={{ width: 50, height: 50 }}
          >
            <FaWhatsapp size={30} />
          </a>

          {/* Contact Button with Phone Icon (on top) */}
          <a
            href="tel:+918097096461"
            aria-label="Call Contact Number"
            style={{ width: 50, height: 50 }}
            className="p-3 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition flex items-center justify-center"
          >
            <FaPhoneAlt size={20} />
          </a>
        </div>
      )}
    </Router>
  );
};

export default App;
