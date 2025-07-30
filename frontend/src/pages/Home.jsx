import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 🔹 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXXSPIcBmSjKYdDTqDkIxrbrsXgKCBG0A",
  authDomain: "src-register-c9557.firebaseapp.com",
  databaseURL: "https://src-register-c9557-default-rtdb.firebaseio.com",
  projectId: "src-register-c9557",
  storageBucket: "src-register-c9557.appspot.com",
  messagingSenderId: "204628060906",
  appId: "1:204628060906:web:78e4dea997a51d991d4593",
  measurementId: "G-6YCC168SGW",
};
// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const Home = () => {
  const [whatsNew, setWhatsNew] = useState([]);
  const [whatsNewLoading, setWhatsNewLoading] = useState(true);
  const [whatsNewError, setWhatsNewError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const [homeContent, setHomeContents] = useState([]);

  const [stats, setStats] = useState([
    { number: 0, label: "Activities in", sublabel: "Cities" },
    { number: 0, label: "Educational Activities", sublabel: "Conducted" },
    { number: 0, label: "Educational Activities", sublabel: "Students" },
    { number: 0, label: "Activities reached", sublabel: "People and youth" },
  ]);

  const calculateAcademicYear = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    if (currentMonth >= 2) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  const limitToTwentyWords = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= 20) return text;
    return words.slice(0, 20).join(" ") + "...";
  };

  useEffect(() => {
    setWhatsNewLoading(true);
    const whatsNewRef = ref(db, "initiatives");

    const unsubscribe = onValue(
      whatsNewRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const newData = Object.keys(data)
            .map((key) => {
              const item = { id: key, ...data[key] };
              if (item.text) item.text = limitToTwentyWords(item.text);
              if (item.description) item.description = limitToTwentyWords(item.description);
              if (item.content) item.content = limitToTwentyWords(item.content);
              if (item.body) item.body = limitToTwentyWords(item.body);
              return item;
            })
            .filter((item) => item.text || item.description || item.content || item.body)
            .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
            .slice(0, 3);

          console.log("Fetched What's New data with content filtering:", newData);

          if (newData.length > 0) {
            setWhatsNew(newData);
          } else {
            setWhatsNewError("No content available at this time. Please check back later.");
          }
          setWhatsNewLoading(false);
        } else {
          console.log("No What's New data available");
          setWhatsNewError("No blog posts found. New content coming soon.");
          setWhatsNew([]);
          setWhatsNewLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching What's New data:", error);
        setWhatsNewError("Failed to load latest updates. Please try again later.");
        setWhatsNewLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const reachesRef = ref(db, "reaches");
    onValue(
      reachesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched Reaches Data:", data);

          setStats([
            { id: "cities", number: data.cities || 0, label: "Activities in", sublabel: "Cities" },
            { id: "educationalActivities1", number: data.educationalActivities || 0, label: "Educational Activities", sublabel: "Conducted" },
            { id: "students", number: data.students || 0, label: "Educational Activities", sublabel: "Students" },
            { id: "peopleReached", number: data.peopleReached || 0, label: "Activities reached", sublabel: "People and youth" },
          ]);
        } else {
          console.warn("No data found in 'reaches' node.");
        }
      },
      (error) => {
        console.error("Firebase Read Error:", error);
      }
    );
  }, []);

  const Counter = ({ end, duration = 3000, label, sublabel }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      if (end > 0) {
        const step = Math.ceil(end / (duration / 300));
        const interval = setInterval(() => {
          start += step;
          if (start >= end) {
            setCount(end);
            clearInterval(interval);
          } else {
            setCount(start);
          }
        }, 50);
        return () => clearInterval(interval);
      }
    }, [end, duration]);
    return (
      <div className="flex flex-col justify-center items-center p-4">
        <div className="text-lg md:text-3xl font-bold text-black mt-2 text-center">
          {label}
        </div>
        <div className="text-4xl md:text-6xl font-bold text-yellow-400 p-4">
          {count}+
        </div>
        <div className="text-lg md:text-3xl font-bold text-black mt-2 text-center">
          {sublabel}
        </div>
      </div>
    );
  };

  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      if (carouselRef.current.scrollLeft <= 0) {
        carouselRef.current.scrollLeft = (carouselRef.current.scrollWidth / 3) * 2;
      } else {
        carouselRef.current.scrollBy({ left: -330, behavior: "smooth" });
      }
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      if (carouselRef.current.scrollLeft >= (carouselRef.current.scrollWidth / 3) * 2) {
        carouselRef.current.scrollLeft = 0;
      } else {
        carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
      }
    }
  };

  const cards = [
    {
      id: 1,
      image: "/img1.png",
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      bgColor: "bg-gray-100",
    },
    {
      id: 2,
      image: "/img2.png",
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      bgColor: "bg-teal-50",
    },
    {
      id: 3,
      image: "/img3.png",
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      bgColor: "bg-gray-100",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const contentRef = ref(db, "homeContent");
    onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contentList = Object.entries(data).map(([id, content]) => ({
          id,
          ...content,
        }));
        setHomeContents(contentList);
      } else {
        setHomeContents([]);
      }
    });
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % homeContent.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + homeContent.length) % homeContent.length);
  };

  useEffect(() => {
    if (homeContent.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [homeContent]);

  const ProgramCard = ({ title, description, image }) => {
    const limitToFifteenWords = (text) => {
      const sanitizedText = text.replace(/<[^>]*>/g, '');
      const words = sanitizedText.split(' ');
      if (words.length <= 15) return sanitizedText;
      return words.slice(0, 15).join(' ') + '...';
    };
  
    return (
      <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden shadow-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm mt-2">{limitToFifteenWords(description)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem('activeNavItem', 'events');
              document.dispatchEvent(
                new CustomEvent('navChange', {
                  detail: { active: 'events' }
                })
              );
              window.location.href = "/events";
            }}
            className="bg-white text-black px-4 py-2 rounded-lg whitespace-nowrap mt-auto z-10"
          >
            Learn more
          </button>
        </div>
      </div>
    );
  };

  const [programcards, setProgramcards] = useState([]);

  useEffect(() => {
    const eventsRef = ref(db, "events");
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventsArray = Object.values(data)
          .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
          .slice(0, 3);
        setProgramcards(eventsArray);
      }
    });
  }, []);

  const [teachers, setTeachers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const teachersRef = ref(db, "teachers");
    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      const loadedTeachers = data ? Object.values(data) : [];
      setTeachers(loadedTeachers);
    });
  }, []);

  useEffect(() => {
    if (teachers.length > 0 && expandedCard === null) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= teachers.length - cardsPerView) {
            return 0;
          }
          return prevIndex + 1;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [teachers.length, cardsPerView, expandedCard]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < teachers.length - cardsPerView ? prev + 1 : 0));
  };

  const [marqueeText, setMarqueeText] = useState("");

  useEffect(() => {
    const fetchMarqueeText = async () => {
      try {
        const marqueeRef = ref(db, "marquee/text");
        const snapshot = await get(marqueeRef);
        if (snapshot.exists()) {
          setMarqueeText(snapshot.val().message);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching marquee text:", error);
      }
    };

    fetchMarqueeText();
  }, []);

  return (
    <>
      <div className="relative w-full h-screen">
        {homeContent.map((content, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="absolute inset-0">
              {content.image && (
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="relative z-10 h-full flex items-center px-6 lg:px-20 -mt-2">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight -mt-2">
                  {content.title.split(" ").slice(0, -4).join(" ")} <br />
                  <span className="block mt-2">
                    {content.title.split(" ").slice(-4).join(" ")}
                  </span>
                </h1>
                {content.content && (
                  <p className="mt-4 text-lg opacity-90">{content.content}</p>
                )}
                <button
                  onClick={() => navigate("/about")}
                  className="bg-white text-gray-700 px-9 py-3 rounded-md transition-all duration-300 hover:bg-gray-100 active:bg-gray-200 mt-6"
                >
                  Read More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {marqueeText && (
        <div>
          <marquee scrollamount="8" className="bg-black text-white py-2 px-3">
            {marqueeText}
          </marquee>
        </div>
      )}

      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 ml-4 md:ml-8 h-full flex flex-col justify-center">
            <div className="flex items-center">
              <div className="w-12 h-0.5 bg-gray-300 mr-4"></div>
              <span className="text-sm text-gray-600 uppercase tracking-wider">
                KNOW ABOUT US
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              We provide a place for children with special needs
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Education is a powerful tool for social change, and it is
              essential that we prioritize the needs of marginalized communities
              to create a more equitable and just society. For too long,
              systemic barriers have prevented disadvantaged groups from
              accessing quality education, perpetuating cycles of poverty and
              limiting opportunities for growth and development. To address
              these disparities, we have identified 17 key initiatives that aim
              to increase access to education, empower marginalized communities,
              and promote inclusive and sustainable development. These
              initiatives are designed to address the unique challenges faced by
              Dalits, Adivasis, girls and women, and other disadvantaged groups,
              and to ensure that education is a catalyst for positive change in
              their lives and communities.
            </p>
            <button
              onClick={() => navigate("/about")}
              className="bg-yellow-500 text-white px-2 py-2 w-fit rounded-md transition-all duration-300 hover:bg-yellow-600 active:bg-yellow-700"
            >
              Learn more
            </button>
          </div>

          <div className="h-full w-full flex justify-center items-center py-4 sm:py-8 md:py-12">
            <img
              src="/hero.jpeg"
              alt="Children walking together"
              className="w-full max-w-2xl h-90 sm:h-[400px] md:h-[500px] object-cover rounded-lg mx-auto"
            />
          </div>
        </div>
      </div>

      <div className="relative bg-[#fff5e1] min-h-screen p-8 z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <div className="rounded-2xl overflow-hidden">
                <img
                  src="/program.png"
                  alt="Children and teacher in classroom"
                  className="w-11/12 h-auto object-cover mx-auto"
                />
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Our Program
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Education is often seen as the great equalizer, yet marginalized
                communities still face barriers to quality learning. The
                Savitribai Phule Resource Centre for Education of Marginalized
                Sections, inspired by Savitribai Phule's legacy, aims to change
                this. Our mission is to provide resources, support, and
                opportunities, breaking down systemic barriers and empowering
                individuals to shape their futures. We envision an inclusive,
                equitable society where education is a right, not a privilege.
              </p>
              <button
                onClick={() => (window.location.href = "/about")}
                className="mt-4 bg-white text-black px-4 py-2 rounded-lg"
              >
                Learn more
              </button>
            </div>
          </div>

          <div className="relative md:block lg:justify-center items-center sm:-bottom-14 md:-bottom-25 lg:-bottom-45 lg:hidden">
            <button
              onClick={scrollLeft}
              className="absolute -left-7 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
            >
              <ChevronLeft size={20} />
            </button>

            <div
              ref={carouselRef}
              className="overflow-x-scroll scrollbar-hide snap-x snap-mandatory w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="inline-flex gap-8 px-5 mt-5 justify-center items-center">
                {programcards.map((card, index) => (
                  <div
                    key={`original-${index}`}
                    className="w-[280px] sm:w-[250px] inline-block snap-center"
                  >
                    <ProgramCard {...card} />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={scrollRight}
              className="absolute -right-7 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="hidden lg:block w-full relative" style={{ top: "8em" }}>
            <div className="flex gap-8 px-5 mt-5 -bottom-40 justify-center items-center">
              {programcards.map((card, index) => (
                <div key={`static-${index}`} className="w-[300px] sm:w-[250px]">
                  <ProgramCard {...card} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-[170vh] w-full bg-gray-900">
        <div
          className="absolute inset-0 bg-center bg-no-repeat sm:hidden"
          style={{
            backgroundImage: `url("./newreach.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            width: "100%",
          }}
        ></div>

        <div
          className="absolute inset-0 bg-center bg-no-repeat hidden sm:block md:hidden"
          style={{
            backgroundImage: `url("./newreach.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            width: "100%",
          }}
        ></div>

        <div
          className="absolute inset-0 bg-center bg-no-repeat hidden md:block lg:hidden"
          style={{
            backgroundImage: `url("./newreach.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            width: "100%",
          }}
        ></div>

        <div
          className="absolute inset-0 bg-center bg-no-repeat hidden lg:block"
          style={{
            backgroundImage: `url("./bigreach.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            width: "100%",
          }}
        ></div>

        <div className="relative container mx-auto px-8 py-8 bg-opacity-50 rounded-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-white justify-center text-center lg:mt-50 mb-6 lg:gap-6 xl:mt-30 md:mt-16 sm:mt-12">
            Reaches {calculateAcademicYear()}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap- lg:mt-10">
            {stats.map((stat, index) => (
              <Counter
                key={index}
                end={stat.number}
                label={stat.label}
                sublabel={stat.sublabel}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full z-10 lg:hidden">
          <img
            src="./mobile.png"
            alt="Group of children"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <section className="p-6 bg-white max-w-screen-xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">WHAT'S NEW</h2>

        {whatsNewLoading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
          </div>
        ) : whatsNewError ? (
          <div className="text-center py-8 bg-red-50 rounded-lg">
            <p className="text-red-600">{whatsNewError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        ) : whatsNew.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {whatsNew.map((initiative) => (
              <div
                key={initiative.id}
                className={`p-4 rounded-lg shadow-md ${initiative.bgColor || "bg-gray-50"}`}
              >
                <img
                  src={initiative.image || "/placeholder-image.png"}
                  alt={initiative.title || "Initiative image"}
                  className="w-full h-[200px] object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.png";
                    e.target.alt = "Image failed to load";
                  }}
                />
                <h3 className="mt-4 font-semibold text-lg">
                  {initiative.title || "New Initiative"}
                </h3>
                <p className="mt-2 text-gray-700">
                  {initiative.description || "No description available."}
                </p>
                <button
                  onClick={() => navigate("/initiative")}
                  className="mt-2 text-yellow-600 hover:text-yellow-800 text-sm"
                >
                  Read more
                </button>
                <div className="mt-3 text-sm text-gray-500">
                  {initiative.timestamp &&
                    new Date(initiative.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No recent initiatives available.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
            >
              Refresh Content
            </button>
          </div>
        )}
      </section>

      <div className="w-full bg-white py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-6 md:gap-8">
          <div className="lg:w-1/3 mb-6 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
              Stories Of Change
            </h2>
            <p className="text-gray-700 mb-6 md:mb-8 text-sm md:text-base">
              Step into the heart of Reiwametta's mission through our Stories of
              Change—a collection of real-life journeys that showcase the
              resilience, determination, and hope of those we serve. From
              children building strong learning foundations to women and youth
              rewriting their futures, these stories highlight the
              transformative power of education and skills. Explore how,
              together with our communities and partners, we're creating lasting
              impact, one story at a time.
            </p>
          </div>

          <div className="lg:w-2/3">
            <div className="relative">
              <div className="overflow-x-hidden w-full">
                <div
                  className="flex transition-transform duration-300 ease-out scrollbar-hide"
                  style={{
                    transform: cardsPerView === 1 ? `translateX(-${currentIndex * 100}%)` : `translateX(-${currentIndex * (100 / 3)}%)`,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {teachers.map((teacher, index) => (
                    <div
                      key={teacher.id}
                      className={`flex-shrink-0 ${cardsPerView === 1 ? 'w-full' : cardsPerView === 2 ? 'w-1/2' : 'lg:w-1/3'} p-2`}
                    >
                      <div
                        className="relative w-full h-96 bg-black rounded-lg overflow-hidden shadow-md cursor-pointer"
                        onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                      >
                        <div
                          className={`w-full transition-all duration-500 ease-in-out ${
                            expandedCard === index ? 'h-1/3' : 'h-full'
                          }`}
                        >
                          <img
                            src={teacher.image}
                            alt={teacher.name}
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-4">
                          <h3 className="text-lg font-bold text-white uppercase">
                            {teacher.name}
                          </h3>
                        </div>
                        <div
                          className={`absolute bottom-0 left-0 w-full bg-white p-4 transition-transform duration-500 ease-in-out ${
                            expandedCard === index ? "translate-y-0" : "translate-y-full"
                          } h-2/3 overflow-y-auto scrollbar-hide`}
                          style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                          }}
                        >
                          <p className="text-gray-800 text-sm">{teacher.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Navigation Buttons - Visible only on mobile */}
              <button
                onClick={goToPrev}
                className="block sm:hidden absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className="block sm:hidden absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
