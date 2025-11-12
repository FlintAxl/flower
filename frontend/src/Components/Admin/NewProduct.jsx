import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Sidebar from './SideBar';
import { getToken } from '../../utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [seller, setSeller] = useState('');
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

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.set('name', name);
    formData.set('price', price);
    formData.set('description', description);
    formData.set('category', category);
    formData.set('stock', stock);
    formData.set('seller', seller);

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

              <form onSubmit={submitHandler} encType="multipart/form-data" className="space-y-10">
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
                    className="w-full mt-4 px-5 py-3 text-base rounded-xl bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:text-base file:font-medium file:bg-purple-100 dark:file:bg-purple-900/40 file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-200 dark:hover:file:bg-purple-900/60"
                  />
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Price
                    </label>
                    <input
                      type="number"
                      id="price_field"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      className="w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label htmlFor="stock_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Stock
                    </label>
                    <input
                      type="number"
                      id="stock_field"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                      className="w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Seller */}
                  <div>
                    <label htmlFor="seller_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Seller
                    </label>
                    <input
                      type="text"
                      id="seller_field"
                      value={seller}
                      onChange={(e) => setSeller(e.target.value)}
                      required
                      className="w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Category
                    </label>
                    <select
                      id="category_field"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-3">
                    <label htmlFor="description_field" className="block mb-2 font-medium text-gray-900 dark:text-white">
                      Description
                    </label>
                    <textarea
                      id="description_field"
                      rows="5"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-5 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:border-purple-600"
                    ></textarea>
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