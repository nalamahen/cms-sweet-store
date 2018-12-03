const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const paths = require('../config/paths');
const isAdmin = auth.isAdmin;
const bucket = require('../config/s3Bucket');
const addAndRemoveImage = require('../service/addRemoveS3Image');


const s3Bucket = bucket('home-brand-images');

// Get Promotion model
const BrandImage = require('../models/brand_image');

router.get('/', isAdmin, (req, res) => {
    BrandImage.find((err, brandImages) => {
        res.render('admin/brand_images', {
            brandImages,
            count: brandImages.length,
            brandImageUrl: paths.s3BrandImageUrl
        });
    });    
});


router.get('/add', isAdmin, (req, res) => {

    const name = "";
    const link = "";

    res.render("admin/add_brand_image", {
        name,
        link
    });

});

router.post('/add', isAdmin, (req, res) => {

    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('name', 'Name must have a value.').notEmpty();
    req.checkBody('link', 'Link must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    const name = req.body.name;
    const link = req.body.link;

    const errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_brand_image', {
            name,
            link,
            errors
        });
    }else {
        BrandImage.findOne({name: name}, (err, brandImage) => {
            if(brandImage) {
                req.flash('danger', 'Brand image name exists, choose another.');
                res.render('admin/add_promotion', {
                    name,
                    link                    
                });
            }else{
                const brandImage = new BrandImage({
                    name,
                    link,
                    image: imageFile                    
                });

                brandImage.save(err => {
                    if(err) {
                        return console.log(err);
                    }

                    if(imageFile) {
                        const brand_image = req.files.image;
                        addAndRemoveImage(s3Bucket, 'add', imageFile, brand_image);
                    }
                    req.flash('success', 'Brand image added');  
                    res.redirect('/admin/brand_images');                  
                })
            }
        });
    }

});

router.get('/edit/:id', isAdmin, (req, res) => {  

    BrandImage.findById(req.params.id, (err, brandImage) => {

        if(err) {
            console.log(err);
            res.redirect('/admin/brand_images');
        }else {
            res.render('admin/edit_brand_image', {
                id: brandImage.id,
                name: brandImage.name,
                link: brandImage.link,
                image: brandImage.image,
                display: brandImage.display,
                brandImageUrl: paths.s3BrandImageUrl
            });
            
        }
    });
});

router.post('/edit/:id', isAdmin, (req, res) => {
    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('name', 'Name must have a value.').notEmpty();
    req.checkBody('link', 'Link must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    const name = req.body.name;    
    const link = req.body.link;    
    const display = req.body.display;
    const id = req.params.id; 
    
    const errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/brand_images/edit/' + id);
    } else {
        BrandImage.findOne({name: name, _id: {'$ne': id}}, (err, brandImage) => {
            if (err)
                console.log(err);

            if (brandImage) {
                req.flash('danger', 'Brand image name exists, choose another.');
                res.redirect('/admin/brand_images/edit/' + id);
            } else {
                BrandImage.findById(id, (err, brandImage) => {
                    if (err)
                        console.log(err);

                    const oldImage = brandImage.image;                      

                    brandImage.name = name;
                    brandImage.link = link;                                      
                    if (imageFile != "") {
                        brandImage.image = imageFile;
                    }
                    brandImage.display = display == 'on' ? true : false;                
                    brandImage.save(err => {
                        const brand_image = req.files.image;                        
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if(oldImage) {                                
                                addAndRemoveImage(s3Bucket, 'delete', oldImage)
                            }                            
                            addAndRemoveImage(s3Bucket, 'add', imageFile, brand_image);                                                        
                        }

                        req.flash('success', 'Brand image edited!');
                        res.redirect('/admin/brand_images/edit/' + id);
                    });

                });
            }
        });
    }

});

router.get('/delete/:id', isAdmin, (req, res) => {

    const id = req.params.id;    

    BrandImage.findByIdAndRemove(id, (err, brandImage) => {
        if(err) {
            console.log(err);
        }else {
            addAndRemoveImage(s3Bucket, 'delete', brandImage.image);            
        }

        req.flash('success', 'Brand image deleted!');
        res.redirect('/admin/brand_images');
    });

});


module.exports = router;