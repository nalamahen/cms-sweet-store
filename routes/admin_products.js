var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var keys = require('../config/keys');
var paths = require('../config/paths');
var isAdmin = auth.isAdmin;

var AWS = require('aws-sdk');
//AWS.config.loadFromPath('./config/upload.json');
AWS.config.accessKeyId = keys.accessKeyId;
AWS.config.secretAccessKey = keys.secretAccessKey;
AWS.config.region = keys.region;

var imageBucket = 'sweet-product-images';
var s3Bucket = new AWS.S3({params: {Bucket: imageBucket}}); 

// Get Sweet model
var Product = require('../models/product');

// Get Brand model
var Brand = require('../models/brand');

/*
 * GET products index
 */
router.get('/', isAdmin, function (req, res) {
    var count;

    Product.count(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            //count: count
            count: products.length,
            productImageUrl: paths.s3ImageUrl
        });   
    });

});

/*
 * GET add product
 */
router.get('/add-product', isAdmin, function (req, res) {
       
    var name = "";
    var desc = "";
    var price = "";

    Brand.find(function (err, brands) {
        res.render('admin/add_product', {
            name: name,
            desc: desc,
            brands: brands,
            price: price
        });
    });

});

/*
 * POST add product
 */

router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('name', 'Name must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var brand = req.body.brand;

    var errors = req.validationErrors();

    if (errors) {
        Brand.find(function (err, brands) {
            res.render('admin/add_product', {
                errors: errors,
                name: name,
                brand: brand,
                desc: desc,
                brands: brands,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product name exists, choose another.');
                Brand.find(function (err, brands) {
                    res.render('admin/add_product', {
                        name: name,
                        desc: desc,
                        brands: brands,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    name: name,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    brand: brand,
                    image: imageFile,
                    instock: true,
                    vat: true
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);
                                        
                    if(imageFile != "") {
                        var productImage = req.files.image;

                        addAndRemoveImage('add', imageFile, productImage, req, res);
                                                
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});

/*
 * GET edit product
 */
router.get('/edit-product/:id', isAdmin, function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Brand.find(function (err, brands) {

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {                
                res.render('admin/edit_product', {
                    name: p.name,
                    errors: errors,
                    desc: p.desc,
                    brands: brands,
                    brand: p.brand.replace(/\s+/g, '-').toLowerCase(),
                    price: parseFloat(p.price).toFixed(2),
                    image: p.image,  
                    productImageUrl: paths.s3ImageUrl,                 
                    instock: p.instock,
                    vat: p.vat,
                    id: p._id
                });                
            }
        });

    });

});


/*
 * POST edit product
 */

router.post('/edit-product/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    console.log('imageFile:', + imageFile);

    req.checkBody('name', 'Name must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var name = req.body.name;    
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var brand = req.body.brand;
    var pimage = req.body.pimage;
    var instock = req.body.instock;
    var id = req.params.id;    

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product name exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    var oldImage = p.image;   

                    p.name = name;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.brand = brand;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }
                    p.instock = instock == 'on' ? true: false;

                    p.save(function (err) {
                        var productImage = req.files.image;
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if(oldImage) {                                
                                addAndRemoveImage('delete', oldImage)
                            }                            
                            addAndRemoveImage('add', imageFile, productImage, req, res);                                                        
                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }

});


/*
 * GET delete product
 */

router.get('/delete-product/:id', isAdmin, function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    Product.findByIdAndRemove(id, function (err, p) {
        if(err) {
            console.log(err);
        }else {
            addAndRemoveImage('delete', p.image);            
        }

        req.flash('success', 'Product deleted!');
        res.redirect('/admin/products');
    });

});

// Exports
module.exports = router;



function addAndRemoveImage(type, imageKey, productImage, req, res) {
    if(type === 'add') {
        var data = { Key: imageKey, ContentType: 'image', Body: productImage.data };
        s3Bucket.putObject(data, function (err, data) {
            if (err) return console.log('Error uploading data: ', data);           
        });

    }else {
        s3Bucket.deleteObject({ Key: imageKey },function (err,data){
              if(err) return console.log('Error deleting image');              
          })
    }
}
