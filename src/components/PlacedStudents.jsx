import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "../context/MyContext";

const PlacedStudents = () => {
  const sliderRef = useRef(null);
  const [students, setStudents] = useState([]);
  const autoScrollIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const { startLoading, stopLoading } = useContext(MyContext);
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        startLoading();
        const res = await axios.get(
          "https://kaivalyainfotechbackend.onrender.com/api/placements"
        );
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching placement data:", err);
      } finally {
        stopLoading();
      }
    };
    fetchStudents();
  }, []);

  const startAutoScroll = () => {
    autoScrollIntervalRef.current = setInterval(() => {
      const slider = sliderRef.current;
      if (slider) {
        const { scrollLeft, scrollWidth, clientWidth } = slider;
        const card = slider.querySelector(".student-card");
        const cardWidth = card ? card.offsetWidth : 240;
        const gap = 20;
        const scrollAmount = cardWidth + gap;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          slider.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 3000);
  };

  const stopAutoScroll = () => {
    clearInterval(autoScrollIntervalRef.current);
  };

  const resetAutoScroll = () => {
    stopAutoScroll();
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      startAutoScroll();
    }, 5000); // restart after 5 seconds
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      stopAutoScroll();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleScroll = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const card = slider.querySelector(".student-card");
    const cardWidth = card ? card.offsetWidth : 240;
    const gap = 20;
    const scrollAmount = cardWidth + gap;

    slider.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    resetAutoScroll(); // pause + restart auto-scroll after interaction
  };

  return (
    <section
      id="interns"
      className="py-12 px-4 sm:px-6 md:px-10 lg:px-14 bg-[#fff8f1] dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto relative">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-5">
          Our Placed Students...
        </h2>

        {students.length > 0 ? (
          <div className="relative">
            {/* Chevron Buttons */}
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 rounded-full shadow p-2 hover:bg-opacity-100 transition"
            >
              <ChevronLeft className="w-6 h-6 text-main-red" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 rounded-full shadow p-2 hover:bg-opacity-100 transition"
            >
              <ChevronRight className="w-6 h-6 text-main-red" />
            </button>

            <div
              ref={sliderRef}
              className="flex gap-5 sm:gap-6 md:gap-8 overflow-x-auto scroll-smooth no-scrollbar py-2"
            >
              {students.map(
                ({ _id, name, postName, companyName, imageUrl }) => (
                  <div
                    key={_id}
                    className="student-card relative flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] bg-gradient-to-br from-[var(--main-red)] to-[#ffd9c3] dark:from-[#ff6a3d] dark:to-[#945444] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 sm:p-5 text-center text-white"
                  >
                    <div className="absolute top-3 left-3 bg-white text-[10px] px-2 py-1 rounded-full font-bold text-[var(--main-red)] shadow-md uppercase tracking-wide">
                      🔥 Achiever
                    </div>
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <img
                        src={imageUrl}
                        alt={`${name} profile`}
                        className="rounded-full w-full h-full object-cover border-4 border-white shadow-md"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-1 truncate">
                      {name}
                    </h3>
                    <p className="text-sm font-medium mb-1 truncate">
                      {postName}
                    </p>
                    <p className="text-xs">
                      Placed at{" "}
                      <span className="font-semibold">{companyName}</span>
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[20rem] w-full"></div>
        )}
      </div>

      {/* Hide Scrollbar Styling */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default PlacedStudents;
