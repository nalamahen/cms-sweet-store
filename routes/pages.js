var express = require('express');
var router = express.Router();
var paths = require('../config/paths');

// Get Page model
var Page = require('../models/page');

// Get Product model
var Product = require('../models/product');
/*
 * GET /
 */
router.get('/', function (req, res) {
    var loggedIn = (req.isAuthenticated()) ? true : false;
    Page.findOne({slug: 'home'}, function (err, page) {

        Product.find({brand: 'jelly-belly', instock: true}, function (err, products) {
            if (err)
                console.log(err);

            res.render('index', {
                title: page.title,
                content: page.content,
                products: products,
                loggedIn: loggedIn,
                count: products.length,                
                productImageUrl: paths.s3ImageUrl
            });
        }).limit(10);
        /*
        if (err)
            console.log(err);

        res.render('index', {
            title: page.title,
            content: page.content
        });
        */
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


