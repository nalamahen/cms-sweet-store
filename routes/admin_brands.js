var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
// Get brand model
var Brand = require('../models/brand');


/*
 * GET brand index/
 */
router.get('/', isAdmin, function (req, res) {
    Brand.find(function (err, brands) {
        if (err) return console.log(err);
        res.render('admin/brands', {
            brands: brands
        });
    })
});


/*
 * GET add brand
 */
router.get('/add-brand', isAdmin, function (req, res) {

    var name = "";

    res.render("admin/add_brand", {
        name: name,
    });
});

/*
 * POST pages index/
 */
router.post('/add-brand', function (req, res) {

    req.checkBody('name', 'Name must have a value.').notEmpty();

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        console.log('errors');
        res.render('admin/add_brand', {
            errors: errors,
            name: name,
        });
    } else {
        Brand.findOne({ slug: slug }, function (err, brand) {
            if (brand) {
                req.flash('danger', 'Brand slug exists, choose another.');
                res.render('admin/add_brand', {
                    name: name,
                });
            } else {
                var brand = new Brand({
                    name: name,
                    slug: slug,
                });

                brand.save(function (err) {
                    if (err)
                        return console.log(err);

                    req.flash('success', 'Brand added!');
                    res.redirect('/admin/brands');
                });
            }
        });
    }
});

// Sort pages function
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }
}

/*
 * GET edit page
 */
router.get('/edit-brand/:id', isAdmin, function (req, res) {

    Brand.findById(req.params.id, function (err, brand) {
        if (err)
            return console.log(err);

        res.render('admin/edit_brand', {
            name: brand.name,
            id: brand._id
        });
    });

});


/*
 * POST edit brand
 */
router.post('/edit-brand/:id', function (req, res) {

    req.checkBody('name', 'Name must have a value.').notEmpty();

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_brand', {
            errors: errors,
            name: name,
            id: id
        });
    } else {
        Brand.findOne({ slug: slug, _id: { '$ne': id } }, function (err, brand) {
            if (brand) {
                req.flash('danger', 'Brand name exists, choose another.');
                res.render('admin/edit_brand', {
                    name: name,
                    id: id
                });
            } else {

                Brand.findById(id, function (err, brand) {
                    if (err)
                        return console.log(err);

                    brand.name = name;
                    brand.slug = slug;

                    brand.save(function (err) {
                        if (err)
                            return console.log(err);

                        Brand.find(function (err, brands) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.brands = brands;
                            }
                        });

                        req.flash('success', 'brand edited!');
                        res.redirect('/admin/brands/edit-brand/' + id);
                    });

                });


            }
        });
    }

});

/*
 * GET delete brand
 */
router.get('/delete-brand/:id', isAdmin, function (req, res) {
   
    Brand.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        Brand.find(function (err, brands) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.brands = brands;
            }
        });

        req.flash('success', 'brand deleted!');
        res.redirect('/admin/brands/');
    });
});


// Exports
module.exports = router;