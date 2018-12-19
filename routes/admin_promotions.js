const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const paths = require('../config/paths');
const isAdmin = auth.isAdmin;
const bucket = require('../config/s3Bucket');
const addAndRemoveImage = require('../service/addRemoveS3Image');
const s3Bucket = bucket('promotions-images');
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

    const title = "";
    const description = "";

    res.render("admin/add_promotion", {
        title,
        description
    });

});

router.post('/add', isAdmin, (req, res) => {

    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('description', 'Description must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    const title = req.body.title;
    const description = req.body.description;

    const errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_promotion', {
            title,
            description,
            errors
        });
    }else {
        Promotion.findOne({title: title}, (err, promotion) => {
            if(promotion) {
                req.flash('danger', 'Promotion name exists, choose another.');
                res.render('admin/add_promotion', {
                    title,
                    description                    
                });
            }else{
                const promotion = new Promotion({
                    title,
                    description,
                    image: imageFile                    
                });

                promotion.save(err => {
                    if(err) {
                        return console.log(err);
                    }

                    if(imageFile) {
                        const promotionImage = req.files.image;
                        addAndRemoveImage(s3Bucket, 'add', imageFile, promotionImage);
                    }
                    req.flash('success', 'Promotion added');  
                    res.redirect('/admin/promotions');                  
                })
            }
        });
    }

});

router.get('/edit/:id', isAdmin, (req, res) => {  

    Promotion.findById(req.params.id, (err, promotion) => {

        if(err) {
            console.log(err);
            res.redirect('/admin/promotions');
        }else {
            res.render('admin/edit_promotion', {
                id: promotion.id,
                title: promotion.title,
                description: promotion.description,
                image: promotion.image,
                display: promotion.display,
                promotionImageUrl: paths.s3PromotionsImageUrl
            });
            
        }
    });
});

router.post('/edit/:id', isAdmin, (req, res) => {
    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('description', 'Description must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    const title = req.body.title;    
    const description = req.body.description;    
    const display = req.body.display;
    const id = req.params.id; 
    
    const errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/promotions/edit/' + id);
    } else {
        Promotion.findOne({title: title, _id: {'$ne': id}}, (err, promotion) => {
            if (err)
                console.log(err);

            if (promotion) {
                req.flash('danger', 'Promotion name exists, choose another.');
                res.redirect('/admin/promotions/edit/' + id);
            } else {
                Promotion.findById(id, (err, promotion) => {
                    if (err)
                        console.log(err);

                    const oldImage = promotion.image;                      

                    promotion.title = title;
                    promotion.description = description;                                      
                    if (imageFile != "") {
                        promotion.image = imageFile;
                    }
                    promotion.display = display == 'on' ? true : false;                
                    promotion.save(err => {
                        const promotionImage = req.files.image;                        
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if(oldImage) {                                
                                addAndRemoveImage(s3Bucket, 'delete', oldImage)
                            }                            
                            addAndRemoveImage(s3Bucket, 'add', imageFile, promotionImage);                                                        
                        }

                        req.flash('success', 'Promotion edited!');
                        res.redirect('/admin/promotions/edit/' + id);
                    });

                });
            }
        });
    }

});

router.get('/delete/:id', isAdmin, (req, res) => {

    const id = req.params.id;    

    Promotion.findByIdAndRemove(id, (err, promotion) => {
        if(err) {
            console.log(err);
        }else {
            addAndRemoveImage(s3Bucket, 'delete', promotion.image);            
        }

        req.flash('success', 'Promotion deleted!');
        res.redirect('/admin/promotions');
    });

});

module.exports = router;