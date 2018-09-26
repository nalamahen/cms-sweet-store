var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var paths = require('../config/paths');


// Get Product model
var Product = require('../models/product');

/*
 * GET add product to cart
 */
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({ slug: slug }, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: paths.s3ImageUrl + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: paths.s3ImageUrl + '/' + p.image 
                });
            }
        }

        //console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});

/*
 * GET checkout page
 */

router.get('/checkout', function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart            
        });
    }

});


/*
 * GET update product
 */
router.get('/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');

});

/*
 * GET clear cart
 */

router.get('/clear', function (req, res) {

    delete req.session.cart;

    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');

});

/*
 * GET buy now
 */

router.get('/buynow', function (req, res) {

    //console.log('req.session.cart', req.session.cart);

    const cartDetails = req.session.cart;
    const user = res.locals.user;
    
    var total = 0;
    var subTotal = 0;
    var emailBody = `<!DOCTYPE html><html><head><title>Bizza Candy - order confirmation</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"></head><body><p>Dear ${user.name}, <br/><br/>Your below order has been received and we will contact you for payment informaton.</p><table class="table table-striped alignmiddle"><tr><th>Name</th><th>Price</th><th>Quantity</th><th>&nbsp;</th></tr>`;
    cartDetails.forEach((product) => {
        subTotal = parseFloat(product.qty * product.price).toFixed(2);
        emailBody += `<tr><td>${product.title}</td><td>${product.price}</td><td>${product.qty}</td><td>${subTotal}</td>`;
        total += +subTotal;
    });

    emailBody += `<tr><td colspan="6" align="right"><b>Total: </b> £${parseFloat(total).toFixed(2)}</td></tr></table><br/><br/> Regards,<br>bizzacandy.com</body></html>`;

    delete req.session.cart;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mail2nalamahen@gmail.com',
            pass: '02me1966'
        }
    });

    var mailOptions = {
        from: 'mail2nalamahen@gmail.com',
        to: 'mail2mahen@yahoo.co.uk',
        subject: 'Thank you for your order',
       html: emailBody
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect('/cart/order');
        }
    });

    //res.sendStatus(200);
    res.redirect('/cart/order');

});

/*
*   Order confirmation 
*/

router.get('/order', (req, res) => {
    res.render('order', {
        title: 'Order Confirmation'
    })
});

// Exports
module.exports = router;


