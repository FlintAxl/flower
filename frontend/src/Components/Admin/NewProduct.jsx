import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MetaData from '../Layout/MetaData';
import Sidebar from './SideBar';
import { getToken } from '../../Utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewProduct = () => {
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Bouquets',
    'Roses',
    'Tulips',
    'Sunflowers',
    'Flower Baskets',
    'Flower Boxes',
    'Vase Arrangements'
  ];

  const navigate = useNavigate();

  // Validation schema
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
      .test('required', 'At least one image is required', (value) => {
        return value && value.length > 0;
      })
      .test('fileSize', 'Each image must be less than 5MB', (value) => {
        if (!value || value.length === 0) return true;
        return value.every((file) => file.size <= 5 * 1024 * 1024);
      })
      .test('fileType', 'Only image files are allowed', (value) => {
        if (!value || value.length === 0) return true;
        return value.every((file) => file.type.startsWith('image/'));
      })
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(productSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.set('name', data.name);
    formData.set('price', data.price);
    formData.set('description', data.description);
    formData.set('category', data.category);
    formData.set('stock', data.stock);
    formData.set('seller', data.seller);

    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getToken()}`,
        },
      };

      await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, formData, config);

      setLoading(false);
      toast.success('Product created successfully', { position: 'bottom-right' });
      navigate('/admin/products');
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Something went wrong', {
        position: 'bottom-right',
      });
    }
  };

const onChange = (e) => {
  const files = Array.from(e.target.files);
  setImages(files); // ✅ Store actual File objects for upload
  setImagesPreview([]); // reset previews
  setValue('images', files, { shouldValidate: true });

  // still show previews
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImagesPreview((old) => [...old, reader.result]);
      }
    };
    reader.readAsDataURL(file);
  });
};


  return (
    <>
      <MetaData title={'New Product'} />
      <div className="min-h-screen bg-white dark:bg-black flex">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 p-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-purple-50 dark:bg-neutral-900 rounded-2xl shadow-lg p-10 border border-purple-200 dark:border-purple-600/30">
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-10 text-center">
                New Product
              </h1>

              <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-10">
                {/* Image Section */}
                <div>
                  <label className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Product Images
                  </label>

                  {imagesPreview.length > 0 && (
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {imagesPreview.map((img, index) => (
                        <img
                          src={img}
                          key={index}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-xl border-2 border-purple-400 dark:border-purple-500/40 flex-shrink-0"
                        />
                      ))}
                    </div>
                  )}

                  <input
                    type="file"
                    name="images"
                    id="customFile"
                    onChange={onChange}
                    multiple
                    accept="image/*"
                    className={`w-full mt-4 px-5 py-3 text-base rounded-xl bg-white dark:bg-neutral-800 border ${
                      errors.images ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                    } text-gray-900 dark:text-white file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:text-base file:font-medium file:bg-purple-100 dark:file:bg-purple-900/40 file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-200 dark:hover:file:bg-purple-900/60`}
                  />
                  {errors.images && (
                    <p className="mt-2 text-sm text-red-500">{errors.images.message}</p>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
                  {/* Name */}
                  <div>
                    <label htmlFor="name_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name_field"
                      {...register('name')}
                      className={`w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border ${
                        errors.name ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                      } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Price
                    </label>
                    <input
                      type="number"
                      id="price_field"
                      {...register('price')}
                      className={`w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border ${
                        errors.price ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                      } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600`}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label htmlFor="stock_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Stock
                    </label>
                    <input
                      type="number"
                      id="stock_field"
                      {...register('stock')}
                      className={`w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border ${
                        errors.stock ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                      } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600`}
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-500">{errors.stock.message}</p>
                    )}
                  </div>

                  {/* Seller */}
                  <div>
                    <label htmlFor="seller_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Seller
                    </label>
                    <input
                      type="text"
                      id="seller_field"
                      {...register('seller')}
                      className={`w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border ${
                        errors.seller ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                      } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600`}
                    />
                    {errors.seller && (
                      <p className="mt-1 text-sm text-red-500">{errors.seller.message}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Category
                    </label>
                    <select
                      id="category_field"
                      {...register('category')}
                      className={`w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border ${
                        errors.category ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                      } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600`}
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

                  {/* Description */}
                  <div className="md:col-span-3">
                    <label htmlFor="description_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Description
                    </label>
                    <textarea
                      id="description_field"
                      rows="5"
                      {...register('description')}
                      className={`w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border ${
                        errors.description ? 'border-red-500' : 'border-purple-300 dark:border-purple-500/30'
                      } text-gray-900 dark:text-white focus:outline-none focus:border-purple-600`}
                    ></textarea>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl text-lg bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'CREATE PRODUCT'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewProduct;