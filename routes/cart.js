const express = require("express");
const router = express.Router();
const paths = require("../config/paths");
const keys = require("../config/keys");
const aws = require("aws-sdk");
const emailParams = require("../service/email");
const uniqid = require("uniqid");
const applyDiscount = require("../service/applyDiscount");
const Product = require("../models/product");
const Order = require("../models/order");

/*
 * GET add product to cart
 */
router.get("/add/:product", function(req, res) {
  const slug = req.params.product;

  Product.findOne({ slug: slug }, function(err, p) {
    if (err) console.log(err);
    if (res.locals.user != null) {
      applyDiscount(res.locals.user.discount_code, p);
    }

    if (typeof req.session.cart == "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(p.price).toFixed(2),
        image: paths.s3ImageUrl + "/" + p.image,
        vat: p.vat,
        product_code: p.product_code
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
          image: paths.s3ImageUrl + "/" + p.image,
          vat: p.vat,
          product_code: p.product_code
        });
      }
    }

    //console.log(req.session.cart);
    req.flash("success", "Product added!");
    res.redirect("back");
  });
});

/*
 * GET checkout page
 */

router.get("/checkout", function(req, res) {
  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;
    res.redirect("/cart/checkout");
  } else {
    res.render("checkout", {
      title: "Checkout",
      cart: req.session.cart
    });
  }
});

/*
 * GET update product
 */
router.get("/update/:product", function(req, res) {
  var slug = req.params.product;
  var cart = req.session.cart;
  var action = req.query.action;
  var quantity = req.query.qty;

  for (var i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch (action) {
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        case "update":
          cart[i].qty = quantity;
          break;
        default:
          console.log("update problem");
          break;
      }
      break;
    }
  }

  //req.flash('success', 'Cart updated!');
  res.redirect("/cart/checkout");
});

/*
 * GET clear cart
 */

router.get("/clear", function(req, res) {
  delete req.session.cart;

  req.flash("success", "Cart cleared!");
  res.redirect("/cart/checkout");
});

/*
 * GET buy now
 */

router.get("/buynow", function(req, res) {
  //console.log('req.session.cart', req.session.cart);
  aws.config.accessKeyId = keys.accessKeyId;
  aws.config.secretAccessKey = keys.secretAccessKey;

  var cartDetails = req.session.cart;
  var user = res.locals.user;
  var orderNo = uniqid.time();

  var order = new Order({
    orderNo,
    user,
    items: cartDetails
  });

  var total = 0;
  var subTotal = 0;
  var emailBody = `<!DOCTYPE html><html><head><title>Bizza Candy - order confirmation</title></head><body<img src="https://bizzcandy.com/images/logo.png"><p>Dear ${
    user.name
  }, <br/><br/>Order Number: ${orderNo}<br/><br/>Your below order has been received and we will contact you for payment details.</p><table style="background-color: transparent; width: 100%; max-width: 100%; margin-bottom: 20px; order-spacing: 0; border-collapse: collapse;"><tr style="padding:8px;line-height:1.42857143;vertical-align:top;border-top: 1px solid #ddd; background-color: #f9f9f9;"><th style="background-color: #f9f9f9;text-align: left; padding:8px;line-height:1.42857143;vertical-align:top;border-top: 1px solid #ddd;">Name</th><th>Price</th><th>Quantity</th><th>Sub Total</th></tr>`;
  cartDetails.forEach(product => {
    subTotal = parseFloat(product.qty * product.price).toFixed(2);
    emailBody += `<tr style="padding:8px;line-height:1.42857143;vertical-align:top;border-top: 1px solid #ddd; background-color: #f9f9f9;"><td style="background-color: #f9f9f9;text-align: left; padding:8px;line-height:1.42857143;vertical-align:top;border-top: 1px solid #ddd;">${
      product.title
    }</td><td>£${product.price}</td><td>${
      product.qty
    }</td><td>£${subTotal}</td>`;
    total += +subTotal;
  });

  emailBody += `<tr style="padding:8px;line-height:1.42857143;vertical-align:top;border-top: 1px solid #ddd; background-color: #f9f9f9;"><td style="background-color: #f9f9f9;text-align: left; padding:8px;line-height:1.42857143;vertical-align:top;border-top: 1px solid #ddd;">&nbsp;</td><td>&nbsp;</td><td><b>Total:</b></td><td><b>£${parseFloat(
    total
  ).toFixed(
    2
  )}</b></td></tr></table><p><b><i>All prices exclude tax and tax will be added to the total.</i></b></p><br/><br/> Regards,<br>bizzacandy.com</body></html>`;

  delete req.session.cart;

  const ses = new aws.SES();
  const params = emailParams.getParams(
    emailParams.fromAddress,
    user.email,
    emailParams.carbonCopy,
    "Thank you for your order",
    emailBody
  );

  try {
    ses.sendEmail(params, function(err, data) {
      if (err) {
        console.log(err.message);
        res.render("admin/admin_error", {
          error: err
        });
      }
    });

    console.log("Email sent to: ", user.email);
    order.save();
  } catch (error) {
    res.status(422).send("Something failed: " + error);
  }

  res.redirect("/cart/order");
});

/*
 *   Order confirmation
 */

router.get("/order", (req, res) => {
  res.render("order", {
    title: "Order Confirmation"
  });
});

// Exports
module.exports = router;
