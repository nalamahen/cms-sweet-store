const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const keys = require('../config/keys');
const paths = require('../config/paths');
const isAdmin = auth.isAdmin;

// Get Promotion model
const Promotion = require('../models/promotion');

router.get('/', isAdmin, (req, res) => {
    Promotion.find((err, promotions) => {
        res.render('admin/promotions', {
            promotions,
            count: promotions.length,
            productImageUrl: paths.s3PromotionsImageUrl
        });
    });    
});


router.get('/add', isAdmin, (req, res) => {

    let title = "";
    let description = "";

    res.render("admin/add_promotion", {
        title: title,
        description: description
    });

});


module.exports = router;