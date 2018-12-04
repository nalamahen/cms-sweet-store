var express = require('express');
var router = express.Router();
var paths = require('../config/paths');

// Get Page model
var Page = require('../models/page');

// Get Product model
var Product = require('../models/product');
var Promotion = require('../models/promotion');
var BrandImage = require('../models/brand_image');
var CategoryImage = require('../models/category_image');
/*
 * GET /
 */
router.get('/', function (req, res) {
    var loggedIn = (req.isAuthenticated()) ? true : false;
    Page.findOne({slug: 'home'}, function (err, page) {
        Product.find({featured: true, instock: true}, function (err, products) {
            Promotion.find({display: true}, (err, promotions) => {
                BrandImage.find({display: true}, (err, brandImages) => {
                    CategoryImage.find({display: true}, (err, categoryImages) => {

                        if (err) console.log(err);
    
                        res.render('index', {
                            title: page.title,
                            content: page.content,
                            products: products,
                            loggedIn: loggedIn,
                            count: products.length,                
                            productImageUrl: paths.s3ImageUrl,
                            promotions: promotions,
                            promotionImageUrl: paths.s3PromotionsImageUrl,
                            brandImages: brandImages,
                            brandImageUrl: paths.s3BrandImageUrl,
                            categoryImages: categoryImages,
                            categoryImageUrl: paths.s3CategoryImageUrl
                        });
                    });
                });

            });
        });
    });
    
});

/*
 * GET a page
 */
router.get('/:slug', function (req, res) {

    var slug = req.params.slug;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Page.findOne({slug: slug}, function (err, page) {

        if (err)
            console.log(err);
        
        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
        
    });

    
});

// Exports
module.exports = router;


