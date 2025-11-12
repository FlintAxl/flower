import React from 'react'
import { Link } from 'react-router-dom'


const Product = ({ product }) => {
  return (
    <div className="product-card">
      <img
        className="product-img"
        src={product.images[0] ? product.images[0].url : null}
        alt={product.name}
      />
      <div className="product-body">
        <h5 className="product-title">{product.name}</h5>
        <div className="ratings">
          <div className="rating-outer">
            <div
              className="rating-inner"
              style={{ width: `${(product.ratings / 5) * 100}%` }}
            ></div>
          </div>
          <span className="reviews">({product.numOfReviews} reviews)</span>
        </div>
        <p className="price">₱{product.price}</p>
        <Link to={`/product/${product._id}`} className="view-btn">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default Product
