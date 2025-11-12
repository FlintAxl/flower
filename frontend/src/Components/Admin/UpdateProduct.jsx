import React, { useState, useEffect } from 'react';
import MetaData from '../Layout/MetaData';
import Sidebar from './SideBar';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { getToken } from '../../utils/helpers';

const UpdateProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [seller, setSeller] = useState('');
  const [images, setImages] = useState([]); // new images (base64)
  const [oldImages, setOldImages] = useState([]); // existing images from server (objects or urls)
  const [imagesPreview, setImagesPreview] = useState([]); // previews for new images (base64)
  const [error, setError] = useState('');
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [updateError, setUpdateError] = useState('');
  const [isUpdated, setIsUpdated] = useState(false);

  const categories = [
    'Bouquets',
    'Roses',
    'Tulips',
    'Sunflowers',
    'Flower Baskets',
    'Flower Boxes',
    'Vase Arrangements'
  ];

  const { id } = useParams();
  const navigate = useNavigate();

  const errMsg = (message = '') =>
    toast.error(message, {
      position: 'bottom-right'
    });
  const successMsg = (message = '') =>
    toast.success(message, {
      position: 'bottom-right'
    });

  const getProductDetails = async (productId) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${productId}`);
      setProduct(data.product || {});
      setLoading(false);
    } catch (err) {
      console.error('Get product error:', err);
      const msg = err?.response?.data?.message || 'Failed to fetch product';
      setError(msg);
      setLoading(false);
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        }
      };
      const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/product/${productId}`, productData, config);
      setLoading(false);
      if (data.success) {
        successMsg('Product updated successfully');
        navigate('/admin/products');
      }
    } catch (err) {
      setLoading(false);
      console.error('Update error:', err);
      const msg = err?.response?.data?.message || 'Error updating product';
      errMsg(msg);
    }
  };

  // Load product details, then populate fields
  useEffect(() => {
    // Fetch when first render or when id changes
    if (!product || product._id !== id) {
      getProductDetails(id);
      return;
    }

    // populate form when product available
    setName(product.name || '');
    setPrice(product.price ?? 0);
    setDescription(product.description || '');
    setCategory(product.category || '');
    setSeller(product.seller || '');
    setStock(product.stock ?? 0);
    // keep oldImages as array of objects or urls
    setOldImages(product.images || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, product._id]); // product._id as dependency so that after fetch the effect runs

  // show errors / success
  useEffect(() => {
    if (error) {
      errMsg(error);
      setError('');
    }
    if (updateError) {
      errMsg(updateError);
      setUpdateError('');
    }
    if (isUpdated) {
      successMsg('Product updated successfully');
      setIsUpdated(false);
      navigate('/admin/products');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, updateError, isUpdated]);

  const submitHandler = (e) => {
    e.preventDefault();

    // Build payload. If there are new images include them, otherwise omit images to keep old images
    const productData = {
      name,
      price,
      description,
      category,
      stock,
      seller,
      images: images.length > 0 ? images : undefined
    };

    updateProduct(id, productData);
  };

  const onChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesPreview([]);
    setImages([]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((oldArray) => [...oldArray, reader.result]);
          setImages((oldArray) => [...oldArray, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper to normalize image src (old image objects may have { url } or be a string)
  const imgSrc = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    // fallback: try public_id or other fields
    return img?.secure_url || img?.public_url || '';
  };

  return (
    <>
      <MetaData title={'Update Product'} />
      <div className="min-h-screen bg-white dark:bg-black flex">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="bg-purple-50 dark:bg-neutral-900 rounded-2xl shadow-lg p-8 border border-purple-200 dark:border-purple-700/40">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Update Product</h1>

              {/* IMAGES: stacked original then new, each in its own scrollable container */}
              <div className="space-y-6 mb-8">
                {/* ORIGINAL IMAGES */}
                <div>
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Original Photos</h2>
                  <div
                    className="rounded-lg border border-purple-300 dark:border-purple-600/40 bg-white dark:bg-neutral-800 p-3 overflow-x-auto"
                    style={{ height: '180px' }}
                  >
                    <div className="flex items-start gap-4 h-full">
                      {oldImages && oldImages.length > 0 ? (
                        oldImages.map((img, idx) => (
                          <img
                            key={`old-${idx}`}
                            src={imgSrc(img)}
                            alt={`Original ${idx}`}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-purple-200 dark:border-purple-500 flex-shrink-0"
                          />
                        ))
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          No original photos
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* NEW IMAGES */}
                <div>
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">New Photos (Preview)</h2>
                  <div
                    className="rounded-lg border border-purple-300 dark:border-purple-600/40 bg-white dark:bg-neutral-800 p-3 overflow-x-auto"
                    style={{ height: '180px' }}
                  >
                    <div className="flex items-start gap-4 h-full">
                      {imagesPreview && imagesPreview.length > 0 ? (
                        imagesPreview.map((img, idx) => (
                          <img
                            key={`new-${idx}`}
                            src={img}
                            alt={`New ${idx}`}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-purple-300 dark:border-purple-500 flex-shrink-0"
                          />
                        ))
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          No new photos selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CHOOSE FILE (below both containers) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Upload New Images</label>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={onChange}
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-100 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-200 dark:hover:file:bg-purple-900/50"
                  />
                </div>
              </div>

              {/* FORM: 3-column grid */}
              <form onSubmit={submitHandler} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Price</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description (span all 3) */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Description</label>
                  <textarea
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base"
                  />
                </div>

                {/* Seller */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Seller Name</label>
                  <input
                    type="text"
                    value={seller}
                    onChange={(e) => setSeller(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base"
                  />
                </div>

                {/* placeholder to keep grid balanced (empty) */}
                <div />

                {/* Submit (span all 3) */}
                <div className="md:col-span-3">
                  <button
                    type="submit"   
                    disabled={loading}
                    className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProduct;
