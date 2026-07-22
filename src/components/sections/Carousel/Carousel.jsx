import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import "./Carousel.css";

const fallbackSlides = [
  {
    id: 1,
    image_url: "/hero-new.png",
    image_mobile_url: "/hero-new-mobile.png",
    title: "Handcrafted Heritage",
    subtitle: "Sjahlendra Handicraft",
    description: "Explore our catalog of sustainable, fair-trade treasures.",
    category: "Catalog",
    link: "https://view.publitas.com/",
    link_label: "See Catalog",
  },
];

const Carousel = () => {
  // Start with fallback slides immediately — hero image is already preloaded
  // via <link rel="preload"> in index.html, so first paint is instant.
  const [slides, setSlides] = useState(fallbackSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Fetch from Supabase in the background and swap in if data differs
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from("carousel_slides")
          .select("*")
          .eq("type", "hero")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setSlides(data);
        }
      } catch {
        // Keep showing fallback slides — no action needed
      }
    };

    fetchSlides();
  }, []);

  const handleShopClick = (slide) => {
    if (
      slide.link &&
      (slide.link.startsWith("http") || slide.link.startsWith("https"))
    ) {
      window.open(slide.link, "_blank");
    } else {
      navigate(slide.link || "/products", {
        state: { category: slide.category },
      });
    }
  };

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="carousel">
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        const isFirst = index === 0;

        return (
          <div
            key={slide.id}
            className={`carousel-slide${isActive ? " active" : ""}${isFirst ? " brand-slide" : ""}`}
          >
            {/*
             * Use <picture> + <img> instead of background-image so that:
             *  - fetchpriority="high" is respected for the first/active slide
             *  - The <link rel="preload"> in index.html actually matches this request
             *  - Non-visible slides are lazy-loaded to save bandwidth
             */}
            <picture>
              {slide.image_mobile_url && (
                <source
                  media="(max-width: 768px)"
                  srcSet={slide.image_mobile_url}
                />
              )}
              <img
                src={slide.image_url}
                alt={slide.title}
                className="carousel-bg-img"
                width="1920"
                height="1080"
                loading={isFirst ? "eager" : "lazy"}
                fetchpriority={isFirst ? "high" : "auto"}
                decoding={isFirst ? "sync" : "async"}
              />
            </picture>

            <div className="carousel-overlay" />

            <div className="carousel-content container">
              {isFirst && (
                <img
                  src="/logo.svg"
                  alt="Sjahlendra Logo"
                  className="carousel-logo-overlay"
                  height="80"
                  fetchpriority="high"
                  style={{ marginBottom: "20px", display: "block", width: "auto" }}
                />
              )}
              <span className="carousel-subtitle">{slide.subtitle}</span>
              <h1 className="carousel-title">{slide.title}</h1>
              <p className="carousel-description">{slide.description}</p>
              <button
                className="btn btn-primary"
                onClick={() => handleShopClick(slide)}
              >
                {slide.link_label || "Shop Now"}
              </button>
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator${index === currentSlide ? " active" : ""}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
