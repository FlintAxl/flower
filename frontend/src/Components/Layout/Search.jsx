import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";

const Search = () => {

    const [keyword, setKeyword] = useState('');
    let navigate = useNavigate();

    const searchHandler = (e) => {
        e.preventDefault()
        if (keyword.trim()) {
           navigate(`/search/${keyword}`)
        } else {
            navigate('/')
        }
    }

    return (
        <form onSubmit={searchHandler} >
            <div className="flex justify-center items-center w-full mt-3">
  <div className="relative w-[60%] max-w-lg">
    <input
      type="text"
      id="search_field"
      placeholder="Search flowers..."
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      className="w-full pl-10 pr-14 py-2.5 text-sm md:text-base border border-purple-300 dark:border-purple-500/30
                 rounded-full bg-white dark:bg-base-dark text-gray-900 dark:text-ink placeholder-gray-400 dark:placeholder-gray-500 shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent 
                 transition-all duration-300 hover:shadow-md"
    />

    {/* Icon inside the input */}
    <i
      className="fa fa-search absolute left-4 top-3 text-gray-400 dark:text-gray-500 text-sm md:text-base"
      aria-hidden="true"
    ></i>

    {/* Search Button */}
    <button
      id="search_btn"
      type="submit"
      className="absolute right-2 top-1.5 bg-purple-400 hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-600
                 text-white px-4 py-1.5 rounded-full transition-all duration-300 
                 text-xs md:text-sm font-medium shadow-sm"
    >
      Search
    </button>
  </div>
</div>

        </form>
    )
}

export default Search