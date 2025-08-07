import { ArrowUp } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { MyContext } from "./context/MyContext";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Pagenotfound from "./pages/Pagenotfound";

const App = () => {
  const { currentUser, appLoading } = useContext(MyContext);
  const location = useLocation();
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
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="flex flex-col items-center space-y-4">
        <ClipLoader color="#e11d48" size={80} speedMultiplier={1.5} />
        <span className="text-lg text-gray-700 dark:text-gray-200 font-medium animate-pulse">
          Loading, please wait...
        </span>
      </div>
    </div>
  );

  // Define routes that should show Navbar, Footer, buttons
  const showFullLayout =
    location.pathname === "/" || location.pathname === "/admin";

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {appLoading && <Spinner />}

      {showFullLayout && <Navbar />}

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
        <Route path="*" element={<Pagenotfound />} />
      </Routes>

      {showFullLayout && <Footer />}

      {showFullLayout && showTopBtn && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-main-red text-white shadow-lg hover:bg-hover-red transition flex items-center justify-center"
          style={{ width: 44, height: 44 }}
        >
          <ArrowUp size={24} />
        </button>
      )}

      {showFullLayout && !appLoading && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col space-y-3">
          <a
            href="https://wa.me/918097096461"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="p-3 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition flex items-center justify-center"
            style={{ width: 50, height: 50 }}
          >
            <FaWhatsapp size={31} />
          </a>

          <a
            href="tel:+918097096461"
            aria-label="Call Contact Number"
            style={{ width: 50, height: 50 }}
            className="p-3 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition flex items-center justify-center"
          >
            <FaPhoneAlt size={21} />
          </a>
        </div>
      )}
    </>
  );
};

export default App;
