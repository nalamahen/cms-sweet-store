var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');


// Connect to db
mongoose.connect(config.database, { useNewUrlParser: true });
//mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/cmscart');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Init app
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;

// Get Page Model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Brand Model
var Brand = require('./models/brand');

// Get all brands to pass to header.ejs
Brand.find(function (err, brands) {
    if (err) {
        console.log(err);
    } else {
        app.locals.brands = brands;
    }
});

// Get Category model;
var Category = require('./models/category');

// Get all categories to pass to sitenav.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

// Express fileUpload middleware
app.use(fileUpload());

// Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
}));

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },    
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                 case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
   res.locals.cart = req.session.cart;
   res.locals.user = req.user || null;
   next();
});

app.post('*', function(req,res,next) {
   res.locals.cart = req.session.cart;
   res.locals.user = req.user || null;
   next();
});

// Set routes
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var adminPages = require('./routes/admin_pages.js');
var adminBrands = require('./routes/admin_brands.js');
var adminBrandImages = require('./routes/admin_brand_images.js');
var adminCategories = require('./routes/admin_categories.js');
var adminCategoryImages = require('./routes/admin_category_images.js');
var adminProducts = require('./routes/admin_products.js');
var adminPromotions = require('./routes/admin_promotions.js');
var adminOrders = require('./routes/admin_orders.js');

app.use('/admin/pages', adminPages);
app.use('/admin/brands', adminBrands);
app.use('/admin/brand_images', adminBrandImages);
app.use('/admin/categories', adminCategories);
app.use('/admin/category_images', adminCategoryImages);
app.use('/admin/products', adminProducts);
app.use('/admin/promotions', adminPromotions);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);
app.use('/admin/orders', adminOrders);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});

