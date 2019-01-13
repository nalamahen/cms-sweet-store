const express = require('express');
const router = express.Router();
const paths = require('../config/paths');
const Product = require('../models/product');
const Brand = require('../models/brand');
const Category = require('../models/category');
const validateDiscountCode = require('../service/validateDiscountCode');
const applyDiscount = require('../service/applyDiscount');

let allBrandSlugs = [];

router.get('/', function (req, res) {
    const loggedIn = (req.isAuthenticated()) ? true : false;    

    
    Product.find({instock:true}, function (err, products) {
        
        if (err) console.log(err);

        applyDiscountPrice(loggedIn, res, products);

        res.render('all_products', {
            title: 'All products',
            products: products,
            count: products.length,
            loggedIn: loggedIn,
            productImageUrl: paths.s3ImageUrl
        });
    });

});

router.post('/search', (req, res) => {
    let searchText = req.body.search;

    if(searchText) {       
        //store the searchText on session for redirect product search page
        req.session.searchTerm = searchText;
    }else {
        searchText = req.session.searchTerm;
    }

    const loggedIn = (req.isAuthenticated()) ? true : false;
   
    searchProduct(searchText, loggedIn, res);
  
});

router.get('/search', (req, res) => {

    const loggedIn = (req.isAuthenticated()) ? true : false;
    const searchText = req.session.searchTerm;
   
    searchProduct(searchText, loggedIn, res);

});

router.get('/:brand', function (req, res) {
    const brandSlug = req.params.brand;

    if(brandSlug === 'search') {
        res.redirect('/products/search');
        return;
    }

    const loggedIn = (req.isAuthenticated()) ? true : false;

    Brand.findOne({slug: brandSlug}, function (err, c) {
        Product.find({brand: brandSlug, instock: true}, function (err, products) {
            if (err)
                console.log(err);

            applyDiscountPrice(loggedIn, res, products);

            res.render('brand_products', {
                title: c.name,
                products: products,
                count: products.length,
                loggedIn: loggedIn,
                productImageUrl: paths.s3ImageUrl
            });
        });
    });

});

router.get('/:brand/:product', function (req, res) {
    
    const loggedIn = (req.isAuthenticated()) ? true : false;
    let products = [];

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {  
            products.push(product);            
            applyDiscountPrice(loggedIn, res, products);
            
            res.render('product', {
                title: product.name,
                p: product,
                productImageUrl: paths.s3ImageUrl,
                loggedIn: loggedIn,
                productImageUrl: paths.s3ImageUrl
            });
        }
    });

});

router.get('/categories/category/:category', function (req, res) {
    const categorySlug = req.params.category;
    const loggedIn = (req.isAuthenticated()) ? true : false;

    Category.findOne({slug: categorySlug}, function (err, c) {
        Product.find({category: categorySlug, instock: true}, function (err, products) {
            if (err)
                console.log(err);

            applyDiscountPrice(loggedIn, res, products);

            res.render('brand_products', {
                title: c.name,
                products: products,
                count: products.length,
                loggedIn: loggedIn,
                productImageUrl: paths.s3ImageUrl
            });
        });
    });

});

module.exports = router;

function searchProduct(searchText, loggedIn, res) {
    if(!searchText) {
        res.redirect('/');
        return;
    }

    Product.find({ "name": { '$regex': new RegExp(searchText, "i") }, "instock": true }, (err, products) => {
        if (err) {
            console.log(err);
        }
        applyDiscountPrice(loggedIn, res, products);
        res.render('all_products', {
            title: 'search products',
            searchText: searchText,
            products: products,
            count: products.length,
            loggedIn: loggedIn,
            productImageUrl: paths.s3ImageUrl,
        });
    });
}

function applyDiscountPrice(loggedIn, res, products) {
    if (loggedIn) {
        const isValidDiscountCode = validateDiscountCode(res.locals.user.discount_code, allBrandSlugs);
        if (isValidDiscountCode) {
            products.map(product => {
                applyDiscount(res.locals.user.discount_code, product);
            });
        }
    }
}

Brand.find(function (err, brands) {
    if (err) {
        console.log(err);
    } else {
        allBrandSlugs = brands.map(brand => brand.slug);
    }
});

