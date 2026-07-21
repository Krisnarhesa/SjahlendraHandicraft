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
  useEffect(() => {
    if (products.length <= 3) return;
    
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        // If reached the end (with a small 10px buffer), scroll back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: 300, behavior: "smooth" }); // Scroll by roughly one item
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [products.length]);

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

  return (
    <div className="promo-carousel-container">
      {headline && <h2 className="promo-carousel-headline">{headline}</h2>}
      
      {products.length > 3 && (
        <button
          className="promo-arrow promo-left"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      <div className="promo-slider" ref={sliderRef}>
        {products.map((product) => (
          <div key={product.id} className="promo-item-wrapper">
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

      {products.length > 3 && (
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
