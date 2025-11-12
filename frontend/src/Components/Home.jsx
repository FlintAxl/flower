import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import axios from 'axios';
import Search from './Layout/Search';
import MetaData from './Layout/MetaData';
import Loader from './Layout/Loader';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [resPerPage, setResPerPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [price, setPrice] = useState([1, 1000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScroll, setShowScroll] = useState(false);

  const { keyword } = useParams();
  let count = keyword ? filteredProductsCount : productsCount;

  const handleChange = (event, newValue) => setPrice(newValue);
  const valuetext = (price) => `₱${price}`;

  const getProducts = async (keyword = '', page = 1, price) => {
    try {
      let link = `http://localhost:4001/api/v1/products?keyword=${keyword}&page=${page}&price[gte]=${price[0]}&price[lte]=${price[1]}`;
      const res = await axios.get(link);

      setProducts(res.data.products);
      setProductsCount(res.data.productsCount);
      setFilteredProductsCount(res.data.filteredProductsCount);
      setResPerPage(res.data.resPerPage);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      setProducts([]);
    }
  };

  useEffect(() => {
    getProducts(keyword, currentPage, price);
  }, [keyword, currentPage, price]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen text-gray-900 dark:text-ink overflow-hidden">
          <MetaData title="Botany & Co | Home" />

          <section className="relative py-16 text-center shadow-inner bg-gradient-to-br from-purple-400/20 via-violet-400/10 to-transparent dark:from-purple-500/10 dark:via-violet-500/5">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-ink mb-4 tracking-wide animate-fadeIn">
              Welcome to <span className="text-purple-600 dark:text-purple-400">Botany & Co</span> 🌸
            </h2>
            <p className="text-gray-700 dark:text-ink-muted text-lg max-w-2xl mx-auto animate-fadeIn">
              Fresh flowers delivered daily • Handcrafted bouquets • Special occasions
            </p>
          </section>

          <div className="max-w-7xl mx-auto px-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-ink tracking-wide">🌺 Fresh Blooms 🌺</h1>
              <div className="flex items-center gap-3 md:w-1/2 md:justify-end">
                <div className="flex-1"><Search /></div>
              </div>
            </div>
          </div>

          <section className="max-w-7xl mx-auto px-6 mt-8 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a href="#collections" className="rounded-xl p-6 bg-gradient-to-br from-purple-100 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/10 border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40 transition shadow-sm hover:shadow-md">
                <p className="text-sm text-gray-600 dark:text-ink-muted">🌷 Curated</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-ink mt-1">Wedding Flowers</h3>
              </a>
              <a href="#products" className="rounded-xl p-6 bg-gradient-to-br from-violet-100 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40 transition shadow-sm hover:shadow-md">
                <p className="text-sm text-gray-600 dark:text-ink-muted">💐 Shop</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-ink mt-1">Birthday Bouquets</h3>
              </a>
              <a href="#newsletter" className="rounded-xl p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40 transition shadow-sm hover:shadow-md">
                <p className="text-sm text-gray-600 dark:text-ink-muted">🎁 Exclusive</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-ink mt-1">Gift Sets</h3>
              </a>
            </div>
          </section>

          <section className="flex flex-col md:flex-row max-w-7xl mx-auto px-6 pb-20 gap-8">
            {keyword && (
              <aside className="md:w-1/4 bg-purple-50 dark:bg-base-soft p-6 rounded-2xl shadow-md border border-purple-200 dark:border-purple-500/20 animate-slideIn">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-ink mb-6 tracking-wide flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="#a78bfa"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414V20l-4-2v-4.293L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span>Filters</span>
                </h3>

                <div className="bg-white dark:bg-base-dark p-4 rounded-xl shadow-sm border border-purple-200 dark:border-purple-500/20 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-ink mb-2 uppercase tracking-wide">
                    Price Range
                  </h4>
                  <Box sx={{ width: '100%' }}>
                    <Slider
                      getAriaLabel={() => 'Price Filter'}
                      value={price}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      getAriaValueText={valuetext}
                      min={1}
                      max={1000}
                      sx={{
                        color: '#a78bfa',
                        '& .MuiSlider-thumb': { border: '2px solid #8b5cf6' },
                        '& .MuiSlider-valueLabel': {
                          backgroundColor: '#8b5cf6',
                          color: '#ffffff',
                        },
                      }}
                    />
                  </Box>
                  <div className="text-sm text-gray-600 dark:text-ink-muted mt-2 flex justify-between">
                    <span>₱{price[0]}</span>
                    <span>₱{price[1]}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-ink mb-3 uppercase tracking-wide">
                    Categories
                  </h4>
                  <ul className="space-y-3">
                    {['Roses', 'Tulips', 'Orchids', 'Sunflowers'].map((category) => (
                      <li
                        key={category}
                        className="flex items-center space-x-2 cursor-pointer bg-gray-100 text-gray-800 dark:bg-base-dark rounded-full py-2 px-4 text-sm dark:text-ink hover:bg-purple-200 dark:hover:bg-purple-900/30 hover:text-gray-900 dark:hover:text-ink transition-all duration-200 border border-transparent hover:border-purple-400 dark:hover:border-purple-500/40 shadow-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                          stroke="#a78bfa"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M12 5l7 7-7 7"
                          />
                        </svg>
                        <span>{category}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}

            <div className={`${keyword ? 'md:w-3/4' : 'w-full'}`}>
              <div
                id="products"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn"
              >
                {products && products.length > 0 ? products.map((product) => (
                  <div
                    key={product._id}
                    className="relative group overflow-hidden bg-white dark:bg-base-soft rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-purple-200 dark:border-purple-500/10"
                  >
                    <div className="p-[1px] rounded-xl bg-gradient-to-tr from-purple-500 via-violet-500 to-indigo-500">
                      <div className="rounded-xl overflow-hidden bg-white dark:bg-base-soft">
                        <img
                          src={product.images && product.images[0] ? product.images[0].url : '/images/default-product.png'}
                          alt={product.name}
                          className="w-full h-60 object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-sm flex items-center space-x-1 border border-white/20">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            fill={i < Math.round(product.ratings) ? "#a78bfa" : "none"}
                            viewBox="0 0 24 24"
                            stroke="#a78bfa"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.09 6.418a1 1 0 00.95.69h6.75c.969 0 1.371 1.24.588 1.81l-5.47 3.974a1 1 0 00-.364 1.118l2.09 6.418c.3.921-.755 1.688-1.54 1.118l-5.47-3.974a1 1 0 00-1.176 0l-5.47 3.974c-.785.57-1.84-.197-1.54-1.118l2.09-6.418a1 1 0 00-.364-1.118L2.67 11.845c-.783-.57-.38-1.81.588-1.81h6.75a1 1 0 00.95-.69l2.09-6.418z"
                            />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-white/80">
                        ({product.numOfReviews})
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-center transition-all duration-300 p-4">
                      <h4 className="text-white font-semibold text-lg mb-2">{product.name}</h4>
                      <p className="text-white/80 text-sm mb-3">{product.category}</p>
                      <span className="text-white font-bold text-xl mb-3">
                        ₱{product.price.toFixed(2)}
                      </span>
                      <a
                        href={`/product/${product._id}`}
                        className="px-4 py-2 rounded-full bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400 text-white hover:opacity-90 transition-all duration-200"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-16">
                    <p className="text-gray-600 dark:text-ink-muted text-lg">No products found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {resPerPage < count && (
                <div className="flex justify-center mt-12">
                  <Stack spacing={2}>
                    <Pagination
                      count={Math.ceil(count / resPerPage)}
                      page={currentPage}
                      onChange={(e, value) => setCurrentPage(value)}
                      color="primary"
                      variant="outlined"
                      shape="rounded"
                      showFirstButton
                      showLastButton
                      size="large"
                      sx={{
                        backgroundColor: '#151518',
                        borderRadius: '12px',
                        '& .MuiPaginationItem-root': {
                          color: '#e8e0d9',
                          borderColor: '#a78bfa',
                        },
                        '& .Mui-selected': {
                          backgroundColor: '#a78bfa !important',
                          color: '#ffffff !important',
                        },
                      }}
                    />
                  </Stack>
                </div>
              )}
            </div>
          </section>

          <section id="collections" className="max-w-7xl mx-auto px-6 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Romantic Roses', desc: 'Express your love', bg: 'from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/15', emoji: '🌹' },
                { title: 'Spring Collection', desc: 'Fresh seasonal blooms', bg: 'from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/15', emoji: '🌼' },
                { title: 'Luxury Arrangements', desc: 'Premium designer bouquets', bg: 'from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/15', emoji: '💐' },
              ].map((c, idx) => (
                <a key={idx} href="#products" className={`rounded-xl p-8 bg-gradient-to-br ${c.bg} border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40 transition shadow-sm hover:shadow-md`}>
                  <div className="text-4xl mb-2">{c.emoji}</div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-ink">{c.title}</h3>
                  <p className="text-gray-700 dark:text-ink-muted mt-1">{c.desc}</p>
                </a>
              ))}
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-6 pb-16">
            <div className="rounded-2xl p-10 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 dark:from-purple-900/40 dark:via-violet-900/40 dark:to-indigo-900/40 border border-purple-300 dark:border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold text-white dark:text-ink">Same Day Delivery 🚚</h3>
                <p className="text-white dark:text-ink-muted mt-2">Order before 2 PM for same-day delivery • Fresh flowers guaranteed</p>
              </div>
              <a href="#products" className="px-6 py-3 rounded-full bg-white text-purple-600 dark:bg-purple-400 dark:text-base-dark font-medium hover:opacity-90 transition shadow-md">Order Now</a>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-6 pb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { t: 'Fresh Daily', d: 'Farm to door', emoji: '🌱' },
                { t: 'Expert Florists', d: 'Handcrafted designs', emoji: '✨' },
                { t: 'Fast Delivery', d: 'Same day available', emoji: '🚚' },
                { t: '100% Satisfaction', d: 'Quality guaranteed', emoji: '💯' },
              ].map((f, i) => (
                <div key={i} className="rounded-xl p-6 bg-purple-50 dark:bg-base-soft border border-purple-200 dark:border-purple-500/20 text-center hover:shadow-md transition">
                  <div className="mx-auto mb-2 text-3xl">{f.emoji}</div>
                  <h4 className="text-gray-900 dark:text-ink font-semibold">{f.t}</h4>
                  <p className="text-gray-600 dark:text-ink-muted text-sm">{f.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-6 pb-16">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-ink mb-6 text-center">What Our Customers Say 💕</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 'Sarah M.', q: 'The roses were absolutely stunning! Lasted over a week. Best flower delivery service!', stars: 5 },
                { n: 'James L.', q: 'Ordered for my wife\'s birthday. She was thrilled! Beautiful arrangement and fast delivery.', stars: 5 },
                { n: 'Emma K.', q: 'Fresh flowers, gorgeous packaging, and the fragrance filled our entire home. Highly recommend!', stars: 5 },
              ].map((r, i) => (
                <div key={i} className="rounded-xl p-6 bg-purple-50 dark:bg-base-soft border border-purple-200 dark:border-purple-500/20 shadow-sm hover:shadow-md transition">
                  <div className="flex mb-2">
                    {[...Array(r.stars)].map((_, idx) => (
                      <span key={idx} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-800 dark:text-ink italic">"{r.q}"</p>
                  <p className="text-gray-600 dark:text-ink-muted mt-3 text-sm font-medium">— {r.n}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="newsletter" className="max-w-3xl mx-auto px-6 pb-16">
            <div className="rounded-2xl p-8 bg-gradient-to-br from-purple-50 to-violet-50 dark:bg-base-soft border border-purple-200 dark:border-purple-500/20 text-center shadow-md">
              <h4 className="text-2xl font-semibold text-gray-900 dark:text-ink">🌸 Join Our Flower Club 🌸</h4>
              <p className="text-gray-700 dark:text-ink-muted mt-2">Get 10% off your first order + exclusive deals on seasonal blooms</p>
              <form className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <input type="email" placeholder="your@email.com" className="px-4 py-3 rounded-full bg-white dark:bg-base-dark border border-purple-300 dark:border-purple-500/20 text-gray-900 dark:text-ink placeholder:text-gray-500 dark:placeholder:text-ink-muted focus:outline-none focus:border-purple-500 dark:focus:border-purple-400/50 shadow-sm" />
                <button type="button" className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white dark:text-base-dark font-medium hover:opacity-90 transition shadow-md">Subscribe</button>
              </form>
            </div>
          </section>

         

          {showScroll && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white dark:text-base-dark hover:opacity-90 transition-all duration-300"
            >
              ↑
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
