import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
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
  const [price, setPrice] = useState([1, 10000]);
  const [priceFilter, setPriceFilter] = useState([1, 10000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScroll, setShowScroll] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState('pagination');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const categories = [
    'Bouquets',
    'Roses',
    'Tulips',
    'Sunflowers',
    'Flower Baskets',
    'Flower Boxes',
    'Vase Arrangements'
  ];

  const { keyword } = useParams();
  // Use filteredProductsCount when there's a keyword, category, or rating filter
  let count = (keyword || selectedCategory || minRating > 0) ? filteredProductsCount : productsCount;

  const handleChange = (event, newValue) => {
    // Update visual slider immediately for smooth interaction
    setPrice(newValue);
  };
  
  const handlePriceChangeCommitted = (event, newValue) => {
    // Update the actual filter when user releases the slider
    setPriceFilter(newValue);
    setPrice(newValue);
  };
  
  const valuetext = (price) => `$${price}`;

  const getProducts = async (keyword = '', page = 1, priceRange, category = '', rating = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }

      let link = `http://localhost:4001/api/v1/products?keyword=${keyword}&page=${page}&price[gte]=${priceRange[0]}&price[lte]=${priceRange[1]}`;
      if (category) {
        link += `&category=${encodeURIComponent(category)}`;
      }
      if (rating > 0) {
        link += `&ratings[gte]=${rating}`;
      }
      const res = await axios.get(link);

      setProducts((prevProducts) =>
        append ? [...prevProducts, ...res.data.products] : res.data.products
      );
      setProductsCount(res.data.productsCount);
      setFilteredProductsCount(res.data.filteredProductsCount);
      setResPerPage(res.data.resPerPage);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      if (!append) {
        setLoading(false);
      }
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    // Only reset when price filter is committed (not during dragging)
    setCurrentPage(1);
    setProducts([]);
  }, [priceFilter, selectedCategory, minRating, keyword]);

  useEffect(() => {
    const append = viewMode === 'infinite' && currentPage > 1;
    getProducts(keyword, currentPage, priceFilter, selectedCategory, minRating, append);
  }, [keyword, currentPage, priceFilter, selectedCategory, minRating, viewMode]);

  // Scroll to top button visibility + infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);

      if (viewMode === 'infinite' && !isFetchingMore) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const nearBottom = scrollTop + clientHeight >= scrollHeight - 200;

        if (!resPerPage || !count) return;

        const totalPages = Math.ceil(count / resPerPage);

        if (nearBottom && currentPage < totalPages) {
          setIsFetchingMore(true);
          setCurrentPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, isFetchingMore, currentPage, count, resPerPage]);

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

          <div className="max-w-7xl mx-auto px-6 mt-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-ink tracking-wide">🌺 Fresh Blooms 🌺</h1>
              <div className="flex items-center gap-3 md:w-1/2 md:justify-end">
                <div className="flex-1"><Search /></div>
                <button
                  onClick={() =>
                    setViewMode((prev) => (prev === 'pagination' ? 'infinite' : 'pagination'))
                  }
                  className="px-3 py-2 rounded-full text-xs sm:text-sm border border-purple-300 bg-purple-50 dark:bg-base-dark text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
                >
                  {viewMode === 'pagination' ? 'Infinite Scroll' : 'Pagination'}
                </button>
                <IconButton
                  onClick={() => setFilterDrawerOpen(true)}
                  className="!bg-purple-100 dark:!bg-purple-900/30 hover:!bg-purple-200 dark:hover:!bg-purple-900/50 !text-purple-600 dark:!text-purple-400 !border !border-purple-300 dark:!border-purple-500/30"
                  aria-label="open filters"
                >
                  <FilterListIcon />
                </IconButton>
              </div>
            </div>
          </div>

          <section className="flex flex-col md:flex-row max-w-7xl mx-auto px-6 pb-20 gap-8">
            <div className="w-full">
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
                        ${product.price.toFixed(2)}
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
              {viewMode === 'pagination' && resPerPage < count && (
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
              {viewMode === 'infinite' && isFetchingMore && (
                <div className="flex justify-center mt-6">
                  <p className="text-sm text-gray-600 dark:text-ink-muted">
                    Loading more products...
                  </p>
                </div>
              )}
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

        

         

          {showScroll && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white dark:text-base-dark hover:opacity-90 transition-all duration-300"
            >
              ↑
            </button>
          )}

          {/* Filter Drawer */}
          <Drawer
            anchor="right"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: '90%', sm: '420px', md: '450px' },
                maxWidth: '450px',
                backgroundColor: 'rgb(250, 245, 255)',
                '@media (prefers-color-scheme: dark)': {
                  backgroundColor: 'rgb(30, 30, 35)',
                },
              },
            }}
          >
            <div className="h-full bg-purple-50 dark:bg-base-soft p-6 md:p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-ink tracking-wide flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="#a78bfa"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414V20l-4-2v-4.293L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span>Filters</span>
                </h3>
                <IconButton
                  onClick={() => setFilterDrawerOpen(false)}
                  className="!text-gray-600 dark:!text-ink-muted hover:!bg-purple-200 dark:hover:!bg-purple-900/30"
                  aria-label="close filters"
                  size="large"
                >
                  <CloseIcon />
                </IconButton>
              </div>

              <div className="bg-white dark:bg-base-dark p-5 md:p-6 rounded-xl shadow-sm border border-purple-200 dark:border-purple-500/20 mb-6">
                <h4 className="text-base font-semibold text-gray-900 dark:text-ink mb-4 uppercase tracking-wide">
                  Price Range
                </h4>
                <Box sx={{ width: '100%', px: 1 }}>
                  <Slider
                    getAriaLabel={() => 'Price Filter'}
                    value={price}
                    onChange={handleChange}
                    onChangeCommitted={handlePriceChangeCommitted}
                    valueLabelDisplay="on"
                    getAriaValueText={valuetext}
                    min={1}
                    max={10000}
                    sx={{
                      color: '#a78bfa',
                      height: 8,
                      '& .MuiSlider-thumb': { 
                        border: '2px solid #8b5cf6',
                        width: 20,
                        height: 20,
                      },
                      '& .MuiSlider-valueLabel': {
                        backgroundColor: '#8b5cf6',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                      },
                      '& .MuiSlider-track': {
                        height: 6,
                      },
                      '& .MuiSlider-rail': {
                        height: 6,
                        opacity: 0.3,
                      },
                    }}
                  />
                </Box>
                <div className="text-base font-medium text-gray-700 dark:text-ink mt-4 flex justify-between items-center">
                  <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">${price[0].toLocaleString()}</span>
                  <span className="text-gray-400 dark:text-gray-500">to</span>
                  <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">${price[1].toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-base-dark p-5 md:p-6 rounded-xl shadow-sm border border-purple-200 dark:border-purple-500/20 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-ink uppercase tracking-wide">
                    Minimum Rating
                  </h4>
                  {minRating > 0 && (
                    <button
                      onClick={() => setMinRating(0)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2.5 mb-4 flex-wrap">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                        minRating >= rating
                          ? 'bg-yellow-400 text-yellow-900 shadow-md'
                          : 'bg-gray-100 dark:bg-base-dark text-gray-400 hover:bg-gray-200 dark:hover:bg-purple-900/30'
                      }`}
                      aria-label={`${rating} star${rating > 1 ? 's' : ''} and up`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={minRating >= rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.09 6.418a1 1 0 00.95.69h6.75c.969 0 1.371 1.24.588 1.81l-5.47 3.974a1 1 0 00-.364 1.118l2.09 6.418c.3.921-.755 1.688-1.54 1.118l-5.47-3.974a1 1 0 00-1.176 0l-5.47 3.974c-.785.57-1.84-.197-1.54-1.118l2.09-6.418a1 1 0 00-.364-1.118L2.67 11.845c-.783-.57-.38-1.81.588-1.81h6.75a1 1 0 00.95-.69l2.09-6.418z"
                        />
                      </svg>
                      <span className="text-sm font-semibold">{rating}+</span>
                    </button>
                  ))}
                </div>
                {minRating > 0 && (
                  <p className="text-sm text-gray-600 dark:text-ink-muted">
                    Showing products with {minRating}+ star{minRating > 1 ? 's' : ''} rating
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-base-dark p-5 md:p-6 rounded-xl shadow-sm border border-purple-200 dark:border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-ink uppercase tracking-wide">
                    Categories
                  </h4>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <ul className="space-y-3">
                  {categories.map((category) => (
                    <li
                      key={category}
                      onClick={() => setSelectedCategory(category === selectedCategory ? '' : category)}
                      className={`flex items-center space-x-3 cursor-pointer rounded-lg py-3 px-4 text-sm transition-all duration-200 border shadow-sm ${
                        selectedCategory === category
                          ? 'bg-purple-500 text-white dark:bg-purple-600 border-purple-600 dark:border-purple-500 shadow-md'
                          : 'bg-gray-100 text-gray-800 dark:bg-base-dark dark:text-ink hover:bg-purple-200 dark:hover:bg-purple-900/30 hover:text-gray-900 dark:hover:text-ink border-transparent hover:border-purple-400 dark:hover:border-purple-500/40'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke={selectedCategory === category ? "#ffffff" : "#a78bfa"}
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14M12 5l7 7-7 7"
                        />
                      </svg>
                      <span className="flex-1 font-medium">{category}</span>
                      {selectedCategory === category && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Drawer>
        </div>
      )}
    </>
  );
};

export default Home;
