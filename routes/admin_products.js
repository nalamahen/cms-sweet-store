var express = require("express");
var router = express.Router();
var auth = require("../config/auth");
var paths = require("../config/paths");
const bucket = require("../config/s3Bucket");
var isAdmin = auth.isAdmin;
var addAndRemoveImage = require("../service/addRemoveS3Image");
var s3Bucket = bucket("sweet-product-images");
var Product = require("../models/product");
var Brand = require("../models/brand");
var Category = require("../models/category");

router.get("/", isAdmin, function(req, res) {
  Product.find(function(err, products) {
    res.render("admin/products", {
      products: products,
      count: products.length,
      productImageUrl: paths.s3ImageUrl
    });
  }).sort("name");
});

router.post("/search", isAdmin, (req, res) => {
  var searchText = req.body.search;

  Product.find(
    {
      $or: [
        { name: { $regex: new RegExp(searchText, "i") } },
        { brand: { $regex: new RegExp(searchText, "i") } },
        { category: { $regex: new RegExp(searchText, "i") } }
      ]
    },
    (err, products) => {
      if (err) {
        console.log(err);
      }

      res.render("admin/products", {
        products: products,
        count: products.length,
        productImageUrl: paths.s3ImageUrl
      });
    }
  );
});

router.get("/add-product", isAdmin, function(req, res) {
  var name = "";
  var desc = "";
  var price = "";
  var product_code = "";

  Brand.find(function(err, brands) {
    Category.find(function(err, categories) {
      res.render("admin/add_product", {
        name: name,
        desc: desc,
        brands: brands,
        categories: categories,
        price: price,
        product_code: product_code
      });
    });
  });
});

router.post("/add-product", function(req, res) {
  var imageFile =
    typeof req.files.image !== "undefined" ? req.files.image.name : "";

  req.checkBody("name", "Name must have a value.").notEmpty();
  req.checkBody("desc", "Description must have a value.").notEmpty();
  req.checkBody("price", "Price must have a value.").isDecimal();
  req.checkBody("image", "You must upload an image").isImage(imageFile);

  var name = req.body.name;
  var slug = name.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var brand = req.body.brand;
  var category = req.body.category;
  var product_code = req.body.product_code;

  var errors = req.validationErrors();

  if (errors) {
    Brand.find(function(err, brands) {
      Category.find(function(err, categories) {
        res.render("admin/add_product", {
          errors: errors,
          name: name,
          brand: brand,
          desc: desc,
          brands: brands,
          price: price,
          product_code: product_code,
          categories: categories
        });
      });
    });
  } else {
    Product.findOne({ slug: slug }, function(err, product) {
      if (product) {
        req.flash("danger", "Product name exists, choose another.");
        Brand.find(function(err, brands) {
          Category.find(function(err, categories) {
            res.render("admin/add_product", {
              name: name,
              desc: desc,
              brands: brands,
              price: price,
              product_code: product_code,
              categories: categories
            });
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
          vat: true,
          product_code: product_code,
          featured: false,
          category: category
        });

        product.save(function(err) {
          if (err) return console.log(err);

          if (imageFile != "") {
            var productImage = req.files.image;

            addAndRemoveImage(s3Bucket, "add", imageFile, productImage);
          }

          req.flash("success", "Product added!");
          res.redirect("/admin/products");
        });
      }
    });
  }
});

router.get("/edit-product/:id", isAdmin, function(req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Brand.find(function(err, brands) {
    Category.find(function(err, categories) {
      Product.findById(req.params.id, function(err, p) {
        if (err) {
          console.log(err);
          res.redirect("/admin/products");
        } else {
          res.render("admin/edit_product", {
            name: p.name,
            errors: errors,
            desc: p.desc,
            brands: brands,
            brand: p.brand.replace(/\s+/g, "-").toLowerCase(),
            price: parseFloat(p.price).toFixed(2),
            image: p.image,
            productImageUrl: paths.s3ImageUrl,
            instock: p.instock,
            vat: p.vat,
            featured: p.featured,
            product_code: p.product_code == "undefined" ? "" : p.product_code,
            id: p._id,
            category: p.category == "undefined" ? "" : p.category,
            categories: categories
          });
        }
      });
    });
  });
});

router.post("/edit-product/:id", function(req, res) {
  var imageFile =
    typeof req.files.image !== "undefined" ? req.files.image.name : "";

  req.checkBody("name", "Name must have a value.").notEmpty();
  req.checkBody("desc", "Description must have a value.").notEmpty();
  req.checkBody("price", "Price must have a value.").isDecimal();
  req.checkBody("image", "You must upload an image").isImage(imageFile);

  var name = req.body.name;
  var slug = name.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var brand = req.body.brand;
  var pimage = req.body.pimage;
  var instock = req.body.instock;
  var vat = req.body.vat;
  var featured = req.body.featured;
  var id = req.params.id;
  var product_code = req.body.product_code;
  var category = req.body.category;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/products/edit-product/" + id);
  } else {
    Product.findOne({ slug: slug, _id: { $ne: id } }, function(err, p) {
      if (err) console.log(err);

      if (p) {
        req.flash("danger", "Product name exists, choose another.");
        res.redirect("/admin/products/edit-product/" + id);
      } else {
        Product.findById(id, function(err, p) {
          if (err) console.log(err);

          var oldImage = p.image;

          p.name = name;
          p.slug = slug;
          p.desc = desc;
          p.price = parseFloat(price).toFixed(2);
          p.brand = brand;
          if (imageFile != "") {
            p.image = imageFile;
          }
          p.instock = instock == "on" ? true : false;
          p.vat = vat == "on" ? true : false;
          p.featured = featured == "on" ? true : false;
          p.product_code = product_code;
          p.category = category;

          p.save(function(err) {
            var productImage = req.files.image;
            if (err) console.log(err);

            if (imageFile != "") {
              if (oldImage) {
                addAndRemoveImage(s3Bucket, "delete", oldImage);
              }
              addAndRemoveImage(s3Bucket, "add", imageFile, productImage);
            }

            req.flash("success", "Product edited!");
            res.redirect("/admin/products/edit-product/" + id);
          });
        });
      }
    });
  }
});

router.get("/delete-product/:id", isAdmin, function(req, res) {
  var id = req.params.id;

  Product.findByIdAndRemove(id, function(err, p) {
    if (err) {
      console.log(err);
    } else {
      addAndRemoveImage(s3Bucket, "delete", p.image);
    }

    req.flash("success", "Product deleted!");
    res.redirect("/admin/products");
  });
});

module.exports = router;
