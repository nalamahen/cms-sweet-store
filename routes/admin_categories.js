var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
// Get category model
var Category = require('../models/category');


/* Get category index */
router.get('/', isAdmin, function (req, res) {
    Category.find(function (err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    })
});

/*  add category */
router.get('/add-category', isAdmin, function (req, res) {

    var name = "";

    res.render("admin/add_category", {
        name: name,
    });
});

/* Post page index */

router.post('/add-category', function (req, res) {

    req.checkBody('name', 'Name must have a value.').notEmpty();

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        console.log('errors');
        res.render('admin/add-category', {
            errors: errors,
            name: name,
        });
    } else {
        Category.findOne({ slug: slug }, function (err, category) {
            if (category) {
                req.flash('danger', 'Category slug exists, choose another.');
                res.render('admin/add-category', {
                    name: name,
                });
            } else {
                var category = new Category({
                    name: name,
                    slug: slug,
                });

                category.save(function (err) {
                    if (err)
                        return console.log(err);

                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                });
            }
        });
    }
});

/*
 * GET edit page
 */
router.get('/edit-category/:id', isAdmin, function (req, res) {

    Category.findById(req.params.id, function (err, category) {
        if (err)
            return console.log(err);

        res.render('admin/edit_category', {
            name: category.name,
            id: category._id
        });
    });

});


/*
 * POST edit category
 */
router.post('/edit-category/:id', function (req, res) {

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
        Category.findOne({ slug: slug, _id: { '$ne': id } }, function (err, category) {
            if (category) {
                req.flash('danger', 'Category name exists, choose another.');
                res.render('admin/edit_category', {
                    name: name,
                    id: id
                });
            } else {

                Category.findById(id, function (err, category) {
                    if (err)
                        return console.log(err);

                        category.name = name;
                        category.slug = slug;

                        category.save(function (err) {
                        if (err)
                            return console.log(err);

                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });

                        req.flash('success', 'category edited!');
                        res.redirect('/admin/categories/edit-category/' + id);
                    });

                });


            }
        });
    }

});

/*
 * GET delete category
 */
router.get('/delete-category/:id', isAdmin, function (req, res) {
    console.log('req.params.id:', req.params.id);
    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

            Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });

        req.flash('success', 'category deleted!');
        res.redirect('/admin/categories/');
    });
});


// Exports
module.exports = router;



