import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "../context/MyContext";

const CertificationsPage = () => {
  const [certifications, setCertifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const scrollRef = useRef(null);
  const { setIsLoginOpen, currentUser } = useContext(MyContext);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const isUserScrollingRef = useRef(false);
  const pauseTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const res = await axios.get(
          "https://kaivalyainfotechbackend.onrender.com/api/certificates"
        );
        setCertifications(res.data);
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
      }
    };
    fetchCertifications();
  }, []);

  const startAutoSlide = () => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isUserScrollingRef.current) return;
      if (
        scrollContainer.scrollLeft + scrollContainer.clientWidth >=
        scrollContainer.scrollWidth - 1
      ) {
        scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 3500);
  };

  const pauseAutoSlide = () => {
    isUserScrollingRef.current = true;
    clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 3000);
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const onUserScroll = () => {
      pauseAutoSlide();
    };

    scrollContainer.addEventListener("scroll", onUserScroll);
    startAutoSlide();

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(pauseTimeoutRef.current);
      scrollContainer.removeEventListener("scroll", onUserScroll);
    };
  }, []);

  const openModal = (cert) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedCert(cert);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCert(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalOpen) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  const scrollLeft = () => {
    pauseAutoSlide();
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    pauseAutoSlide();
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <>
      <section
        id="certifications"
        className="bg-[#fff8f1] md:min-h-[80vh] flex justify-center items-center dark:bg-gray-900"
      >
        <div className="max-w-7xl w-full px-4 relative">
          <h2 className="text-3xl md:text-5xl font-extrabold text-black dark:text-white mb-1 mt-8 md:mb-0  tracking-tight drop-shadow-md select-none">
            Our Students offer letter...
          </h2>

          <button
            className="absolute top-1/2 left-3 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-400 p-1 rounded-full shadow hover:bg-gray-100"
            onClick={scrollLeft}
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-7 h-7 text-main-red" />
          </button>

          <button
            className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-400 p-1 rounded-full shadow hover:bg-gray-100"
            onClick={scrollRight}
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-7 h-7 text-main-red" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-4 scrollbar-hide py-6 md:px-2"
            tabIndex={0}
            aria-label="Certificate slider"
          >
            {certifications.length > 0 ? (
              certifications.map(
                ({
                  _id,
                  title,
                  issuer,
                  description,
                  issueDate,
                  certificateUrl,
                }) => (
                  <div
                    key={_id}
                    className="flex-shrink-0 snap-start w-full sm:w-[300px] min-w-[280px] bg-white dark:bg-gray-800 border border-main-red dark:border-gray-700 shadow-xl transition-transform duration-300 hover:scale-105 relative"
                  >
                    <button
                      onClick={() =>
                        openModal({
                          title,
                          certificateUrl,
                          issuer,
                          description,
                          issueDate,
                        })
                      }
                      className="absolute top-[40%] left-1/2 -translate-x-1/2 px-3 py-1 text-sm bg-main-red text-white cursor-pointer font-semibold shadow hover:bg-orange-600 transition"
                      title="View Certificate"
                    >
                      View
                    </button>

                    <div className="h-100 overflow-hidden bg-gradient-to-tr from-yellow-100 via-yellow-50 to-yellow-100 shadow-inner">
                      <img
                        src={certificateUrl}
                        alt={`${title} certicateUrl`}
                        className="w-full h-full object-contain object-center pointer-events-none select-none"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="flex items-center justify-center w-full h-96"></div>
            )}
          </div>
        </div>
      </section>

      {modalOpen && selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative bg-white dark:bg-gray-900 rounded-xl p-6 max-w-3xl w-full mx-4 overflow-y-auto max-h-[85vh] border-2 border-main-red shadow-xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-3xl text-red-500 hover:text-red-700 transition"
              title="Close"
            >
              &times;
            </button>

            <h3 className="text-2xl font-bold text-main-red dark:text-orange-300 mb-4 text-center">
              {selectedCert.title}
            </h3>
            <img
              src={selectedCert.certificateUrl}
              alt={`${selectedCert.title} certificateUrl`}
              className="w-full h-auto rounded-md border"
              draggable={false}
            />
            <div className="mt-4 space-y-1 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Issuer:</strong> {selectedCert.issuer}
              </p>
              <p>
                <strong>Description:</strong> {selectedCert.description}
              </p>
              <p className="text-sm italic text-gray-500">
                Issued on:{" "}
                {new Date(selectedCert.issueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default CertificationsPage;
