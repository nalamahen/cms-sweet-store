var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
//var auth = require('../config/auth');
//var isUser = auth.isUser;

// Get Product model
var Product = require('../models/product');

// Get Brand model
var Brand = require('../models/brand');

/*
 * GET all products
 */
router.get('/', function (req, res) {
//router.get('/', isUser, function (req, res) {
    var loggedIn = (req.isAuthenticated()) ? true : false;
    
    Product.find({instock:true}, function (err, products) {
        if (err)
            console.log(err);

        res.render('all_products', {
            title: 'All products',
            products: products,
            count: products.length,
            loggedIn: loggedIn
        });
    });

});

router.post('/search', (req, res) => {
    var searchText = req.body.search;
    var loggedIn = (req.isAuthenticated()) ? true : false;
   
    Product.find({"name" : {'$regex': new RegExp(searchText, "i")}, "instock":true} , (err, products) => {        
        if(err) {
            console.log(err);
        }

         res.render('all_products', {
            title: 'search products',
            products: products,
            count: products.length,
            loggedIn: loggedIn
        });
    });
  
});


/*
 * GET products by brand
 */
router.get('/:brand', function (req, res) {

    var brandSlug = req.params.brand;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Brand.findOne({slug: brandSlug}, function (err, c) {
        Product.find({brand: brandSlug, instock: true}, function (err, products) {
            if (err)
                console.log(err);

            res.render('brand_products', {
                title: c.name,
                products: products,
                count: products.length,
                loggedIn: loggedIn
            });
        });
    });

});

/*
 * GET product details
 */
router.get('/:brand/:product', function (req, res) {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.name,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }
    });

});

// Exports
module.exports = router;


