import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* Skeleton that mirrors ProductSlider dimensions to prevent CLS */
const ProductSliderSkeleton = () => (
  <div className="product-slider-skeleton">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="slider-skeleton-item">
        <div className="slider-skeleton-img loading-shimmer" />
        <div className="slider-skeleton-title loading-shimmer" />
        <div className="slider-skeleton-sub loading-shimmer" />
      </div>
    ))}
  </div>
);
import Carousel from "../../components/sections/Carousel/Carousel";
import CategoryGrid from "../../components/sections/CategoryGrid/CategoryGrid";
import ProductSlider from "../../components/sections/ProductSlider/ProductSlider";
import PromoCarousel from "../../components/sections/PromoCarousel/PromoCarousel";
import { supabase } from "../../lib/supabaseClient";
import "./Home.css";

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [midBanner, setMidBanner] = useState(null);
  const [homeAboutBg, setHomeAboutBg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch newest products
      const { data: newData, error: newError } = await supabase
        .from("products")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(15);

      if (newError) throw newError;
      setNewArrivals(newData || []);

      // Fetch trending/best sellers
      const { data: trendData, error: trendError } = await supabase
        .from("products")
        .select("*")
        .eq("is_best_seller", true)
        .eq("is_hidden", false)
        .limit(15);

      if (trendError) throw trendError;

      // If not enough best sellers, fallback to oldest items just for demo variety
      if (!trendData || trendData.length < 4) {
        const { data: fallbackData } = await supabase
          .from("products")
          .select("*")
          .eq("is_hidden", false)
          .order("created_at", { ascending: true })
          .limit(15);
        setTrendingProducts(fallbackData || []);
      } else {
        setTrendingProducts(trendData || []);
      }

      // Fetch mid banner
      const { data: bannerData } = await supabase
        .from("carousel_slides")
        .select("*")
        .eq("type", "mid_banner")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (bannerData) {
        setMidBanner(bannerData);
      }

      // Fetch home about background
      const { data: bgData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "home_about_bg")
        .maybeSingle();
      
      if (bgData && bgData.value) {
        setHomeAboutBg(bgData.value);
      }

    } catch (error) {
      console.error("Error fetching home products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Carousel />
      </section>

      {/* Promo Banner Carousel */}
      <section className="section-promo">
        <PromoCarousel />
      </section>

      {/* New Arrivals Slider */}
      <section className="section new-arrivals-section">
        <div className="container">
          <h2 className="section-title text-center">NEW ARRIVAL</h2>
          {loading ? (
            <ProductSliderSkeleton />
          ) : (
            <ProductSlider products={newArrivals} />
          )}
        </div>
      </section>

      {/* Collections/Categories Highlight */}
      <CategoryGrid />

      {/* Static Promo Banner */}
      {midBanner && (
        <section className="section container text-center">
          <div className="static-promo">
            {midBanner.link ? (
              <a href={midBanner.link} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                <img
                  src={midBanner.image_url}
                  alt={midBanner.title || "Promo Banner"}
                  style={{
                    borderRadius: "8px",
                    width: "100%",
                    aspectRatio: "3 / 1",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </a>
            ) : (
              <img
                src={midBanner.image_url}
                alt={midBanner.title || "Handcrafted Perfection"}
                style={{
                  borderRadius: "8px",
                  width: "100%",
                  aspectRatio: "3 / 1",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* Trending Products Slider */}
      <section className="section container">
        <h2 className="section-title text-center">TRENDING PRODUCTS</h2>
        {loading ? (
          <ProductSliderSkeleton />
        ) : (
          <ProductSlider products={trendingProducts} />
        )}
      </section>

      {/* About Preview */}
      <section className="about-preview-section section">
        <div className="container">
          <div className="about-card">
            <div 
              className="about-card-bg"
              style={{ backgroundImage: `url(${homeAboutBg || '/hero-new.png'})` }}
            />
            <div className="about-content">
              <h2 className="section-title">Rooted in Tradition</h2>
              <p>
                Sjahlendra Handicraft was born from a deep respect for Balinese
                artistry. We partner directly with local artisans to create pieces
                that tell a story. Every item is handmade using sustainable
                materials, ensuring that while we beautify your home, we also
                protect our planet.
              </p>
              <Link
                to="/about"
                className="btn btn-outline"
                style={{ marginTop: "30px", display: "inline-block" }}
              >
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
