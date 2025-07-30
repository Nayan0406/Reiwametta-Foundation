import React, { useState, useEffect } from 'react';
import { Target, Facebook, Twitter, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from 'firebase/database';

// Firebase Configuration
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

// Initialize Firebase
let app;
let db;

const initializeFirebase = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      db = getDatabase(app);
      console.log("Firebase initialized successfully");
    }
    return { app, db };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return { error };
  }
};

// Manually defined Program Manager data
const programManager = [
  {
    id: 1,
    name: "Prashant Randive",
    role: "Program Manager",
    image: "/pm.jpeg", // Working image URL - replace with your actual image
    bio: "Working at Savitribai Phule Resource Centre, Development professional, alumnus of Azim Premji University"
  },
];

const About = () => {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [educators, setEducators] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

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
    window.addEventListener('resize', handleResize, { passive: true });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      const { db, error } = initializeFirebase();
      if (error) {
        setError("Failed to initialize Firebase");
        setLoading(false);
        return;
      }

      const foundersRef = ref(db, "founders");
      onValue(foundersRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const foundersList = Object.entries(data).map(([id, founder]) => ({
              id,
              ...founder,
            }));
            setFounders(foundersList);
          } else {
            setFounders([]);
          }
          setLoading(false);
        } catch (err) {
          console.error("Error processing founders data:", err);
          setError("Failed to process founders data");
          setLoading(false);
        }
      }, (err) => {
        console.error("Error fetching founders:", err);
        setError("Failed to fetch founders");
        setLoading(false);
      });

      const mentorsRef = ref(db, "mentors");
      onValue(mentorsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const mentorsList = Object.entries(data).map(([id, mentor]) => ({
              id,
              ...mentor,
            }));
            setMentors(mentorsList);
          } else {
            setMentors([]);
          }
        } catch (err) {
          console.error("Error processing mentors data:", err);
        }
      }, (err) => {
        console.error("Error fetching mentors:", err);
      });

      const educatorsRef = ref(db, "educators");
      onValue(educatorsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const educatorsList = Object.entries(data).map(([id, educator]) => ({
              id,
              ...educator,
            }));
            setEducators(educatorsList);
          } else {
            setEducators([]);
          }
        } catch (err) {
          console.error("Error processing educators data:", err);
        }
      }, (err) => {
        console.error("Error fetching educators:", err);
      });
    } catch (err) {
      console.error("Unexpected error in useEffect:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (educators.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= educators.length - cardsPerView) {
            return 0;
          }
          return prevIndex + 1;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [educators.length, cardsPerView]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev < educators.length - cardsPerView ? prev + 1 : 0
    );
  };

  const objectives = [
    {
      text: "Increasing Access to Education: Provide educational opportunities to marginalized communities, including Dalits, Adivasis, and other disadvantaged groups, to ensure equitable access to quality education."
    },
    {
      text: "Enhancing Vocational Skills: Offer vocational training programs to the marginalized communities, equipping them with skills relevant to local job markets and enhancing their employability."
    },
    {
      text: "Promoting Cultural Preservation: Support initiatives that preserve and promote the cultural heritage and languages of marginalized communities, integrating indigenous knowledge in education."
    },
    {
      text: "Community Development: Engage in community development projects aimed at improving infrastructure, healthcare, and socio-economic conditions in marginalized areas."
    },
    {
      text: "Monitoring and Evaluation: Regularly monitor the effectiveness of educational programs targeting marginalized communities, conducting evaluations to assess impact and refine strategies for continuous improvement."
    },
    {
      text: "Encouraging Entrepreneurship: Foster entrepreneurship among marginalized youth by offering training in business development and financial management to support establishment of small businesses and micro-enterprises."
    },
    {
      text: "Environmental Education and Sustainability: Integrate environmental education into the curriculum, teaching sustainable practices, conservation, and climate change resilience."
    },
    {
      text: "Collaborating with Government and NGOs: Forge partnerships with government agencies, NGOs and other stakeholders to leverage resources and maximize impact in addressing educational challenges faced by marginalized populations."
    },
    {
      text: "Long-term Sustainable Development: Foster long-term sustainable development by investing in education as a catalyst for social and economic empowerment, aiming to break the cycle of poverty."
    },
    {
      text: "Empowering Girls and Women: Develop initiatives to empower girls and women from marginalized backgrounds through education and skill development to overcome gender disparities."
    },
    {
      text: "Ensuring Inclusive Education: Advocate practices that accommodate the diverse needs of marginalized students, students with disabilities and from remote areas."
    },
    {
      text: "Providing Scholarships and Financial Aid: Establish scholarship programs and financial aid schemes to enable students from marginalized backgrounds to pursue higher education and professional courses."
    },
    {
      text: "Advocacy and Awareness: Advocate for policies and initiatives that address the systemic barriers hindering educational opportunities for marginalized groups."
    },
    {
      text: "Promoting Digital Literacy: Bridge the digital divide by providing access to digital resources, training, and technology infrastructure to marginalized communities, empowering them to navigate the digital world."
    },
    {
      text: "Addressing Social Stigma and Discrimination: Organize campaigns and workshops to challenge social stigma and discrimination faced by marginalized groups in educational settings."
    },
    {
      text: "Promoting Civic Engagement and Leadership: Empower marginalized youth to become active citizens and leaders in their communities through civic education and leadership training for community service and advocacy."
    },
    {
      text: "Research and Policy Advocacy: Conduct research on educational issues affecting marginalized communities and use evidence-based advocacy to influence policy decisions that prioritize equity, inclusion, and social justice in education."
    }
  ];

  const ProfileImage = ({ name, imageUrl }) => {
    const fallbackImage = "https://via.placeholder.com/264"; // Reliable fallback

    return (
      <div className="w-64 h-64 overflow-hidden rounded-2xl">
        <img
          src={imageUrl || fallbackImage}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`Failed to load image for ${name}: ${imageUrl}`);
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
          onLoad={() => console.log(`Successfully loaded image for ${name}: ${imageUrl}`)}
        />
      </div>
    );
  };

  const SocialLinks = ({ links }) => {
    const socialLinks = links || {};

    return (
      <div className="flex justify-center space-x-4">
        {socialLinks.facebook && (
          <a
            href={socialLinks.facebook}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="w-5 h-5" />
          </a>
        )}
        {socialLinks.twitter && (
          <a
            href={socialLinks.twitter}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="w-5 h-5" />
          </a>
        )}
        {socialLinks.instagram && (
          <a
            href={socialLinks.instagram}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="w-5 h-5" />
          </a>
        )}
      </div>
    );
  };

  const FounderCard = ({ founder }) => (
    <div className="max-w-xs text-center">
      <ProfileImage name={founder.name} imageUrl={founder.imageUrl} />
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {founder.name}
        </h3>
        <p className="text-gray-600 mb-4">{founder.title}</p>
      </div>
      <SocialLinks links={founder.social} />
    </div>
  );

  const ProgramManagerCard = ({ programManager }) => (
    <div className="max-w-xs text-center">
      <ProfileImage name={programManager.name} imageUrl={programManager.image} />
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {programManager.name}
        </h3>
        <p className="text-gray-600 mb-4">{programManager.role || "Program Manager"}</p>
      </div>
    </div>
  );

  const MentorCard = ({ mentor }) => (
    <div className="max-w-xs text-center">
      <ProfileImage name={mentor.name} imageUrl={mentor.imageUrl} />
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {mentor.name}
        </h3>
        <p className="text-gray-600 mb-4">{mentor.role || "Mentor"}</p>
      </div>
      <SocialLinks links={mentor.social} />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <section className="bg-amber-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8 md:space-y-12">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wider text-gray-600">
                KNOW ABOUT US
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
                Reiwametta Foundation Believes
                <span className="inline-block mx-2">
                  Education is a powerful
                </span>
                <br className="md:hidden" />
                tool for social change
              </h2>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="md:max-w-2xl">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                  Education
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Education is a powerful tool for social change, and it is
                  essential that we prioritize the needs of marginalized
                  communities to create a more equitable and just society. For
                  too long, systemic barriers have prevented disadvantaged
                  groups from accessing quality education, perpetuating cycles
                  of poverty and limiting opportunities for growth and
                  development. To address these disparities, we must ensure fair
                  and immediate access to resources, empower marginalized
                  communities, and promote inclusive and sustainable
                  development. These initiatives are designed to address the
                  unique challenges faced by Dalits, Adivasis, girls and women,
                  and other disadvantaged groups, ensuring that education is a
                  catalyst for positive change in their lives and communities.
                </p>
              </div>

              <div className="w-full flex justify-center">
                <div className="relative w-full max-w-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/b_JpawhIMr0"
                    title="YouTube Video"
                    allowFullScreen
                    loading="lazy"
                    className="w-full aspect-video rounded-lg shadow-lg"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-sm uppercase tracking-wider text-gray-600">
              OBJECTIVE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {objectives.map((objective, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-amber-50 p-3 rounded-full">
                  <Target className="w-6 h-6 text-black" />
                </div>
                <p className="text-sm text-gray-800 leading-relaxed flex-1">
                  {objective.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-amber-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-lg overflow-hidden mb-8">
            <img
              src="/about-img.png"
              alt="People working together"
              className="w-full h-[300px] md:h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-2xl md:text-3xl text-white font-bold text-center px-4">
                FEW REASONS WHY PEOPLE <br /> SHOULD CHOOSE US!
              </h2>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-sm md:text-base text-gray-600 leading-relaxed text-justify">
              People choose Reivametta Foundation because of our unwavering
              commitment to breaking down systemic barriers and addressing
              deep-rooted inequalities in education for marginalized
              communities. Our tailored initiatives—ranging from vocational
              training and scholarships to digital literacy and entrepreneurship
              programs—are designed to equip disadvantaged individuals with the
              skills needed for economic independence. We began our journey with
              grassroots engagement, ensuring our efforts are deeply rooted in
              the unique challenges faced by Dalit, Adivasi, and other
              marginalized groups. Through strong partnerships with government
              agencies, NGOs, and other stakeholders, we advocate for policies
              that promote equity and inclusion, making a broader systemic
              impact. Our dedication to continuous monitoring and evaluation
              ensures our programs remain effective and impactful, evolving to
              meet the needs of the communities we serve. By fostering
              leadership, civic engagement, environmental sustainability, and
              cultural preservation, Reivametta Foundation takes a holistic
              approach to empowerment, championing social justice and creating
              opportunities for every individual to lead a fulfilling life and
              contribute meaningfully to society.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-amber-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h2 className="text-sm uppercase tracking-wider text-gray-600">
                OUR MISSION
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                "Education for Equality: Empowering Marginalized Communities for
                Sustainable Growth"
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                To create an equitable and just society where every marginalized
                community, including Dalits, Adivasis, girls, women, and other
                disadvantaged groups, has access to quality education and
                opportunities for growth, leading to their empowerment and the
                overall sustainable development of their communities.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm uppercase tracking-wider text-gray-600">
                OUR VISION
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                "Empowering Education for All: Breaking Barriers, Building
                Futures"
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We aim to break systemic barriers to education by providing
                marginalized communities with resources, opportunities, and
                support, promoting inclusion, skill development, and empowerment
                for a fulfilling and impactful life.
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-gray-600">
              OUR JOURNEY
            </h2>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              "Reivametta Foundation: Bridging Educational Gaps, Empowering
              Communities, Transforming Futures"
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Reivametta Foundation addresses educational inequalities by
              empowering marginalized communities through key initiatives,
              partnerships, and advocacy, promoting access, inclusion, and
              sustainable development while fostering leadership, cultural
              preservation, and social justice.
            </p>
          </div>
        </div>
      </section>

      {/* Founders Section - Only show if founders exist */}
      {founders.length > 0 && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet our founders
            </h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              Meet the visionary founders who established our mission to transform education and empower communities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 justify-items-center">
              {founders.map((founder) => (
                <FounderCard key={founder.id} founder={founder} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Meet our mentors
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Meet the dedicated mentors who are shaping futures by providing personalized guidance, fostering growth, and nurturing a culture of continuous learning and development.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 justify-items-center text-center">
            {mentors.length > 0 && mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}

            {mentors.length === 0 && (
              <p className="col-span-full text-gray-500">No mentors found.</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Meet our program manager
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Meet the dedicated program manager driving impactful education through strategic planning and seamless coordination.
          </p>

          <div className="justify-items-center text-center">
            {programManager.length > 0 ? (
              programManager.map((pm) => (
                <ProgramManagerCard key={pm.id} programManager={pm} />
              ))
            ) : (
              <p className="col-span-full text-gray-500">No program manager found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Educators Section */}
      <section className="py-12 px-6 bg-amber-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Educators
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Meet the dedicated educators who are transforming lives through quality education and mentorship.
          </p>

          {educators.length > 0 ? (
            <div className="relative">
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10">
                <button
                  onClick={goToPrev}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
              </div>

              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
                <button
                  onClick={goToNext}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </div>

              <div className="overflow-hidden w-full">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{
                    transform: cardsPerView === 1
                      ? `translateX(-${currentIndex * 100}%)`
                      : `translateX(-${currentIndex * (100 / cardsPerView)}%)`
                  }}
                >
                  {educators.map((educator) => (
                    <div
                      key={educator.id}
                      className={`flex-shrink-0 ${cardsPerView === 1
                          ? 'w-full'
                          : cardsPerView === 2
                            ? 'w-1/2'
                            : 'w-1/3'
                        } p-2`}
                    >
                      <div className="overflow-hidden shadow-md h-full rounded-lg">
                        <img
                          src={educator.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face"}
                          alt={educator.name}
                          className="w-full h-80 md:h-96 sm:h-72 object-cover"
                          onError={(e) => {
                            console.error(`Failed to load educator image for ${educator.name}: ${educator.image}`);
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face";
                          }}
                        />
                        <div className="bg-yellow-400 p-4 md:p-6 h-full">
                          <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">
                            {educator.name}
                          </h3>
                          <p className="text-gray-800 mb-2 md:mb-2 text-xs md:text-sm">
                            {educator.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center space-x-2 mt-6">
                {educators.length > cardsPerView &&
                  Array.from({ length: Math.ceil(educators.length / cardsPerView) }).map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 rounded-full transition-all ${Math.floor(currentIndex / cardsPerView) === index
                          ? 'w-6 bg-gray-800'
                          : 'w-2 bg-gray-400'
                        }`}
                      onClick={() => setCurrentIndex(index * cardsPerView)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))
                }
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No educators available at the moment.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default About;