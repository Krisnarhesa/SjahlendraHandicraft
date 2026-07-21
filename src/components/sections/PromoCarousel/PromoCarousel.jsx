import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import "./PromoCarousel.css";

const PromoCarousel = () => {
  const [products, setProducts] = useState([]);
  const [headline, setHeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_promo", true)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching promo products:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchHeadline = async () => {
      try {
        const { data } = await supabase.from("site_settings").select("value").eq("key", "promo_headline").maybeSingle();
        if (data && data.value) {
          setHeadline(data.value);
        }
      } catch (err) {
        console.error("Error fetching promo headline:", err);
      }
    };

    fetchPromoProducts();
    fetchHeadline();
  }, []);

  // Auto-scroll logic
  // Auto-scroll logic and infinite scroll setup
  useEffect(() => {
    if (products.length <= 1) return;
    
    // Initial jump to the middle set so we can scroll both ways infinitely
    if (sliderRef.current) {
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.style.scrollBehavior = "auto";
          sliderRef.current.scrollLeft = sliderRef.current.scrollWidth / 3;
          sliderRef.current.style.scrollBehavior = "smooth";
        }
      }, 100);
    }
    
    const interval = setInterval(() => {
      if (sliderRef.current) {
        sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [products]);

  const scrollTimeoutRef = useRef(null);

  const handleScroll = () => {
    if (!sliderRef.current || products.length <= 1) return;
    
    // Clear timeout if still scrolling
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    // Wait until scrolling stops completely
    scrollTimeoutRef.current = setTimeout(() => {
      if (!sliderRef.current) return;
      
      const { scrollLeft, scrollWidth } = sliderRef.current;
      const third = scrollWidth / 3;

      // Jump seamlessly to keep the scroll position in the middle set
      if (scrollLeft <= third * 0.1) {
        sliderRef.current.style.scrollBehavior = "auto";
        sliderRef.current.scrollLeft += third;
        setTimeout(() => {
          if (sliderRef.current) sliderRef.current.style.scrollBehavior = "smooth";
        }, 50);
      } else if (scrollLeft >= third * 1.9) {
        sliderRef.current.style.scrollBehavior = "auto";
        sliderRef.current.scrollLeft -= third;
        setTimeout(() => {
          if (sliderRef.current) sliderRef.current.style.scrollBehavior = "smooth";
        }, 50);
      }
    }, 150);
  };

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth;
      if (direction === "left") {
        sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (loading || products.length === 0) return null;

  const displayProducts = products.length > 1 ? [...products, ...products, ...products] : products;

  return (
    <div className="promo-carousel-container">
      {headline && <h2 className="promo-carousel-headline">{headline}</h2>}
      
      {products.length > 1 && (
        <button
          className="promo-arrow promo-left"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      <div className="promo-slider" ref={sliderRef} onScroll={handleScroll}>
        {displayProducts.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="promo-item-wrapper">
            <Link
              to={`/product/${encodeURIComponent(product.name)}`}
              className="promo-circle-link"
            >
              <div className="promo-circle">
                <img
                  src={product.image_url || 'https://placehold.co/400x400/f0f0f0/999?text=No+Image'}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className="promo-product-name">{product.name}</h3>
            </Link>
          </div>
        ))}
      </div>

      {products.length > 1 && (
        <button
          className="promo-arrow promo-right"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight size={32} />
        </button>
      )}
    </div>
  );
};

export default PromoCarousel;
