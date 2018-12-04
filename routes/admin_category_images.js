const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const paths = require('../config/paths');
const isAdmin = auth.isAdmin;
const bucket = require('../config/s3Bucket');
const addAndRemoveImage = require('../service/addRemoveS3Image');


const s3Bucket = bucket('home-category-images');

// Get CategoryImage model
const CategoryImage = require('../models/category_image');

router.get('/', isAdmin, (req, res) => {
    CategoryImage.find((err, categoryImages) => {
        res.render('admin/category_images', {
            categoryImages,
            count: categoryImages.length,
            categoryImageUrl: paths.s3CategoryImageUrl
        });
    });    
});


router.get('/add', isAdmin, (req, res) => {

    const name = "";
    const link = "";

    res.render("admin/add_category_image", {
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
        res.render('admin/add_category_image', {
            name,
            link,
            errors
        });
    }else {
        CategoryImage.findOne({name: name}, (err, categoryImage) => {
            if(categoryImage) {
                req.flash('danger', 'Category image name exists, choose another.');
                res.render('admin/add_category_image', {
                    name,
                    link                    
                });
            }else{
                const categoryImage = new CategoryImage({
                    name,
                    link,
                    image: imageFile                    
                });

                categoryImage.save(err => {
                    if(err) {
                        return console.log(err);
                    }

                    if(imageFile) {
                        const category_image = req.files.image;
                        addAndRemoveImage(s3Bucket, 'add', imageFile, category_image);
                    }
                    req.flash('success', 'Category image added');  
                    res.redirect('/admin/category_images');                  
                })
            }
        });
    }

});

router.get('/edit/:id', isAdmin, (req, res) => {  

    CategoryImage.findById(req.params.id, (err, categoryImage) => {

        if(err) {
            console.log(err);
            res.redirect('/admin/category_images');
        }else {
            res.render('admin/edit_category_image', {
                id: categoryImage.id,
                name: categoryImage.name,
                link: categoryImage.link,
                image: categoryImage.image,
                display: categoryImage.display,
                categoryImageUrl: paths.s3CategoryImageUrl
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
        res.redirect('/admin/category_images/edit/' + id);
    } else {
        CategoryImage.findOne({name: name, _id: {'$ne': id}}, (err, categoryImage) => {
            if (err)
                console.log(err);

            if (categoryImage) {
                req.flash('danger', 'Category image name exists, choose another.');
                res.redirect('/admin/category_images/edit/' + id);
            } else {
                CategoryImage.findById(id, (err, categoryImage) => {
                    if (err)
                        console.log(err);

                    const oldImage = categoryImage.image;                      

                    categoryImage.name = name;
                    categoryImage.link = link;                                      
                    if (imageFile != "") {
                        categoryImage.image = imageFile;
                    }
                    categoryImage.display = display == 'on' ? true : false;                
                    categoryImage.save(err => {
                        const category_image = req.files.image;                        
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if(oldImage) {                                
                                addAndRemoveImage(s3Bucket, 'delete', oldImage)
                            }                            
                            addAndRemoveImage(s3Bucket, 'add', imageFile, category_image);                                                        
                        }

                        req.flash('success', 'Category image edited!');
                        res.redirect('/admin/category_images/edit/' + id);
                    });

                });
            }
        });
    }

});

router.get('/delete/:id', isAdmin, (req, res) => {

    const id = req.params.id;    

    CategoryImage.findByIdAndRemove(id, (err, categoryImage) => {
        if(err) {
            console.log(err);
        }else {
            addAndRemoveImage(s3Bucket, 'delete', categoryImage.image);            
        }

        req.flash('success', 'Category image deleted!');
        res.redirect('/admin/category_images');
    });

});


module.exports = router;