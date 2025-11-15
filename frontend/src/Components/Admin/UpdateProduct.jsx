import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MetaData from '../Layout/MetaData';
import Sidebar from './SideBar';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';

const UpdateProduct = () => {
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

  // Validation schema (images optional for update)
  const productSchema = yup.object().shape({
    name: yup
      .string()
      .required('Product name is required')
      .max(100, 'Product name cannot exceed 100 characters')
      .trim(),
    price: yup
      .number()
      .typeError('Price must be a number')
      .required('Price is required')
      .positive('Price must be greater than 0')
      .max(99999, 'Price cannot exceed 99999'),
    description: yup
      .string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters'),
    category: yup
      .string()
      .required('Please select a category')
      .oneOf(categories, 'Please select a valid category'),
    stock: yup
      .number()
      .typeError('Stock must be a number')
      .required('Stock is required')
      .integer('Stock must be a whole number')
      .min(0, 'Stock cannot be negative')
      .max(99999, 'Stock cannot exceed 99999'),
    seller: yup
      .string()
      .required('Seller name is required')
      .trim(),
    images: yup
      .mixed()
      .nullable()
      .test('fileSize', 'Each image must be less than 5MB', (value) => {
        if (!value || value.length === 0) return true;
        return value.every((file) => file.size <= 5 * 1024 * 1024);
      })
      .test('fileType', 'Only image files are allowed', (value) => {
        if (!value || value.length === 0) return true;
        return value.every((file) => file.type.startsWith('image/'));
      })
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: yupResolver(productSchema),
    mode: 'onChange'
  });

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
    reset({
      name: product.name || '',
      price: product.price ?? 0,
      description: product.description || '',
      category: product.category || '',
      seller: product.seller || '',
      stock: product.stock ?? 0
    });
    // keep oldImages as array of objects or urls
    setOldImages(product.images || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, product._id, reset]); // product._id as dependency so that after fetch the effect runs

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

  const onSubmit = (data) => {
    // Build payload. If there are new images include them, otherwise omit images to keep old images
    const productData = {
      name: data.name,
      price: data.price,
      description: data.description,
      category: data.category,
      stock: data.stock,
      seller: data.seller,
      images: images.length > 0 ? images : undefined
    };

    updateProduct(id, productData);
  };

  const onChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesPreview([]);
    setImages([]);
    setValue('images', files, { shouldValidate: true });

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
                    className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border ${
                      errors.images ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                    } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-100 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-200 dark:hover:file:bg-purple-900/50`}
                  />
                  {errors.images && (
                    <p className="mt-2 text-sm text-red-500">{errors.images.message}</p>
                  )}
                </div>
              </div>

              {/* FORM: 3-column grid */}
              <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border ${
                      errors.name ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                    } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Price</label>
                  <input
                    type="number"
                    {...register('price')}
                    className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border ${
                      errors.price ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                    } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Category</label>
                  <select
                    {...register('category')}
                    className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border ${
                      errors.category ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                    } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>

                {/* Description (span all 3) */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Description</label>
                  <textarea
                    rows="5"
                    {...register('description')}
                    className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border ${
                      errors.description ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                    } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Stock</label>
                  <input
                    type="number"
                    {...register('stock')}
                    className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border ${
                      errors.stock ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                    } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base`}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-500">{errors.stock.message}</p>
                  )}
                </div>

                {/* Seller */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Seller Name</label>
                  <input
                    type="text"
                    {...register('seller')}
                    className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-800 border ${
                      errors.seller ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                    } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600 text-base`}
                  />
                  {errors.seller && (
                    <p className="mt-1 text-sm text-red-500">{errors.seller.message}</p>
                  )}
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
