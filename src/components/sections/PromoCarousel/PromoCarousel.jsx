import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import "./PromoCarousel.css";

const PromoCarousel = () => {
  const [products, setProducts] = useState([]);
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

    fetchPromoProducts();
  }, []);

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
