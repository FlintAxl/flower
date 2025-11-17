import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MetaData from "../Layout/MetaData";
import { Carousel } from "react-bootstrap";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser, getToken, successMsg, errMsg } from '../../Utils/helpers'
import ListReviews from '../Review/ListReviews';
import axios from "axios";

const ProductDetails = ({ addItemToCart, cartItems }) => {
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [btnPulse, setBtnPulse] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(getUser())
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errorReview, setErrorReview] = useState('');
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState('')
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  const { id } = useParams();
  let navigate = useNavigate();

  // Check if user can review this product
  const checkReviewEligibility = async (productId) => {
    if (!user) {
      setCanReview(false)
      setReviewEligibilityMessage('Please login to review products')
      return
    }

    try {
      setCheckingEligibility(true)
      const config = {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/review/eligibility?productId=${productId}`,
        config
      )

      setCanReview(data.canReview)
      setReviewEligibilityMessage(data.message)
    } catch (error) {
      setCanReview(false)
      setReviewEligibilityMessage(
        error.response?.data?.message || 'Unable to check review eligibility'
      )
    } finally {
      setCheckingEligibility(false)
    }
  }

  // fetch product
  const productDetails = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:4001/api/v1/product/${id}`);
      setProduct(data.product || {});
      
      // Check if user has already reviewed this product
      if (user && data.product.reviews) {
        const existingReview = data.product.reviews.find(
          review => review.user === user._id
        );
        setUserReview(existingReview || null);
      }

      // Check review eligibility
      if (user && data.product._id) {
        checkReviewEligibility(data.product._id)
      }
    } catch (err) {
      console.error(err);
      setError('Product not found')
    }
  };

  useEffect(() => {
    productDetails(id);
    // small mount animation trigger
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, [id]);

  // Listen for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    // Check initially
    checkDarkMode();
    
    // Create observer to watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Error and success handling
  useEffect(() => {
    if (error) {
      errMsg(error)
      navigate('/')
      setError('')
    }

    if (errorReview) {
      errMsg(errorReview)
      setErrorReview('')
    }
    if (success) {
      successMsg('Review posted successfully')
      setSuccess(false)
      // Refresh product data to show new review
      productDetails(id);
      // Reset form
      setRating(0);
      setComment('');
      setShowReviewModal(false);
    }
  }, [error, errorReview, success]);

  // quantity functions
  const increaseQty = () => {
    if (quantity >= (product.stock ?? 0)) return;
    setQuantity((q) => q + 1);
  };

  const decreaseQty = () => {
    if (quantity <= 1) return;
    setQuantity((q) => q - 1);
  };

  // add to cart with pulse feedback
  const handleAddToCart = async () => {
    await addItemToCart(id, quantity);
    // pulse button briefly
    setBtnPulse(true);
    setTimeout(() => setBtnPulse(false), 600);
  };

  // Rating system functions
  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    // Optional: Add hover effects if needed
  };

  const handleStarLeave = () => {
    // Optional: Remove hover effects if needed
  };

  const newReview = async (reviewData) => {
    try {
      setSubmittingReview(true)
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      }

      const { data } = await axios.put(`${import.meta.env.VITE_API}/review`, reviewData, config)
      
      if (data.success) {
        setSuccess(true)
        successMsg('Review submitted successfully!')
        setShowReviewModal(false)
        setRating(0)
        setComment('')
        // Refresh product data
        productDetails(id)
      }
    } catch (error) {
      setErrorReview(error.response?.data?.message || 'Error submitting review')
      errMsg(error.response?.data?.message || 'Error submitting review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const reviewHandler = () => {
    if (rating === 0) {
      errMsg('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      errMsg('Please write a review comment');
      return;
    }

    const formData = new FormData();
    formData.set('rating', rating);
    formData.set('comment', comment);
    formData.set('productId', id);
    newReview(formData)
  }

  const openReviewModal = () => {
    setShowReviewModal(true);
  }

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setRating(0);
    setComment('');
  }

  // computed rating width
  const ratingPercent = product.ratings ? (product.ratings / 5) * 100 : 0;

  return (
    <>
      <MetaData title={product.name || "Product"} />

      {/* small inline styles for pulse keyframe and rating stars */}
      <style>{`
        @keyframes soft-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,92,246,0.25); }
          70% { transform: scale(1.03); box-shadow: 0 10px 30px -10px rgba(139,92,246,0.18); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        .soft-pulse { animation: soft-pulse 0.6s ease-in-out; }
        
        /* Modal backdrop animation */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-slideIn">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Submit Review</h5>
              <button 
                type="button" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                onClick={closeReviewModal}
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              {/* Star Rating */}
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-3xl mx-1 cursor-pointer transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-300`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                name="review"
                id="review"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="4"
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-200"
                  onClick={closeReviewModal}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 font-semibold"
                  onClick={reviewHandler}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex justify-center items-start py-8 px-4 md:px-6">
        {/* Instagram-style card */}
        <div
          key={isDark ? 'dark' : 'light'}
          className={`${isDark ? 'bg-base-soft border-purple-500/20 shadow-lg' : 'bg-white border-gray-200 shadow-sm'} rounded-xl overflow-hidden flex flex-col w-full max-w-2xl transform transition-all duration-700
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {/* Instagram-style header */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-purple-500/20' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold">
                {product.seller ? product.seller.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-ink text-sm">{product.seller || "Botany & Co"}</p>
                <p className="text-xs text-gray-500 dark:text-ink-muted">Flower Shop</p>
              </div>
            </div>
            <button className="text-gray-600 dark:text-ink-muted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Image Carousel - Instagram feed style */}
          <div className="w-full">
            <Carousel pause="hover" className="w-full" indicators={false}>
              {product.images &&
                product.images.map((img) => (
                  <Carousel.Item key={img.public_id}>
                    <div className="w-full aspect-square overflow-hidden bg-gray-100 dark:bg-base-soft">
                      <img
                        src={img.url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Carousel.Item>
                ))}
            </Carousel>
          </div>

          {/* Content section */}
          <div className="p-4">
            {/* Product name */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-ink mb-2">
              {product.name || "Product Name"}
            </h2>

            {/* Seller info */}
            <p className="text-sm text-gray-600 dark:text-ink-muted mb-3">
              Sold by: <span className="font-semibold text-gray-900 dark:text-ink">{product.seller || "Botany & Co"}</span>
            </p>

            {/* Rating stars */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < Math.round(product.ratings || 0);
                  return (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${filled ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  );
                })}
              </div>
              <span className="text-sm text-gray-600 dark:text-ink-muted">({product.numOfReviews ?? 0} reviews)</span>
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
              ${product.price ? Number(product.price).toFixed(2) : "0.00"}
            </p>

            {/* Stock status */}
            <p className="text-sm mb-4">
              <span className="text-gray-600 dark:text-ink-muted">Status: </span>
              <span className={`font-semibold ${product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </p>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-base-dark rounded-full px-3 py-2">
                <button
                  onClick={decreaseQty}
                  aria-label="Decrease quantity"
                  className="w-8 h-8 rounded-full bg-purple-400 dark:bg-purple-500 text-white text-xl flex items-center justify-center hover:bg-purple-500 dark:hover:bg-purple-600 transition"
                >
                  −
                </button>

                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-12 text-center text-base bg-transparent border-none text-gray-900 dark:text-ink font-semibold"
                />

                <button
                  onClick={increaseQty}
                  aria-label="Increase quantity"
                  className="w-8 h-8 rounded-full bg-purple-400 dark:bg-purple-500 text-white text-xl flex items-center justify-center hover:bg-purple-500 dark:hover:bg-purple-600 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 rounded-full text-white font-semibold shadow-sm transition-all duration-300 ${
                  product.stock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                } ${btnPulse ? "soft-pulse" : ""}`}
              >
                Add to Cart
              </button>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-purple-500/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-ink mb-2">Description</h3>
              <p className="text-gray-700 dark:text-ink-muted leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Review Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-purple-500/20">
              {user ? (
                <div className="space-y-3">
                  {checkingEligibility ? (
                    <div className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking review eligibility...
                    </div>
                  ) : canReview ? (
                    <button 
                      id="review_btn" 
                      type="button" 
                      className={`w-full py-3 px-4 rounded-lg transition font-semibold flex items-center justify-center gap-2 ${
                        userReview 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                      }`}
                      onClick={openReviewModal}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                      {userReview ? 'You have reviewed this product' : 'Write a Review'}
                    </button>
                  ) : (
                    <div className="w-full py-3 px-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg border border-orange-200 dark:border-orange-800 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="font-medium">Cannot Review</span>
                    </div>
                  )}
                  
                  {reviewEligibilityMessage && (
                    <p className={`text-sm text-center ${
                      canReview 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {reviewEligibilityMessage}
                    </p>
                  )}
                </div>
              ) : (
                <div className="alert alert-danger mt-5 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                  Login to post your review.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* List Reviews Component */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-8">
        <ListReviews 
          reviews={product.reviews || []} 
          productId={product._id}
          onReviewUpdate={() => productDetails(id)}
        />
      </div>
    </>
  );
};

export default ProductDetails;