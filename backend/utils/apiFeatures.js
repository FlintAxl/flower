product = require("../models/product");
class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    // http://localhost:2173?keyword=apple&price[]
    // http://localhost:4001/api/v1/products?page=1&keyword=apple&price[lte]=1000&price[gte]=10
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {}
        console.log(this.query, this.queryStr);
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        // { 'price[gte]': '100', 'price[lte]': '1000', 'category': 'Roses' }
        const queryCopy = { ...this.queryStr };
        // console.log(queryCopy);
        // Removing fields from the query
        const removeFields = ['keyword',  'page']
        removeFields.forEach(el => delete queryCopy[el]);

        let priceFilter = {};
        if (queryCopy['price[gte]'] || queryCopy['price[lte]']) {
            priceFilter.price = {};
            if (queryCopy['price[gte]']) {
                priceFilter.price.$gte = Number(queryCopy['price[gte]']);
            }
            if (queryCopy['price[lte]']) {
                priceFilter.price.$lte = Number(queryCopy['price[lte]']);
            }
// priceFilter {
//     price: {
//         $gte: 100,
//         $lte: 1000
//     }
// }
            delete queryCopy['price[gte]'];
            delete queryCopy['price[lte]'];
        }

        // Handle category filter
        let categoryFilter = {};
        if (queryCopy['category']) {
            categoryFilter.category = queryCopy['category'];
            delete queryCopy['category'];
        }

        // Handle ratings filter
        let ratingsFilter = {};
        if (queryCopy['ratings[gte]']) {
            ratingsFilter.ratings = {};
            ratingsFilter.ratings.$gte = Number(queryCopy['ratings[gte]']);
            delete queryCopy['ratings[gte]'];
        }

        // Merge all filters
        const filters = { ...priceFilter, ...categoryFilter, ...ratingsFilter, ...queryCopy };

        console.log(queryCopy);

        this.query = this.query.find(filters);
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}
module.exports = APIFeatures