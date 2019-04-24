const express = require("express");
const router = express.Router();
const auth = require("../config/auth");
const isAdmin = auth.isAdmin;

const Order = require("../models/order");

router.get("/", isAdmin, (req, res) => {
  Order.find((err, orders) => {
    res.render("admin/orders", {
      orders,
      count: orders.length
    });
  })
    .populate("user", "name email")
    .sort("date");
});

router.get("/:id", isAdmin, (req, res) => {
  Order.findById(req.params.id, (err, order) => {
    if (err) console.log(err);
    res.render("admin/order_items", {
      order
    });
  }).populate("user", "name");
});

router.get("/user/:id", isAdmin, (req, res) => {
  Order.find({ user: { _id: req.params.id } }, (err, orders) => {
    if (err) console.log(err);
    res.render("admin/orders", {
      orders,
      count: orders.length
    });
  });
});

router.get("/delete/:id", isAdmin, (req, res) => {
  Order.findByIdAndDelete(req.params.id, err => {
    if (err) console.log(err);

    req.flash("success", "order deleted!");
    res.redirect("/admin/orders/");
  });
});

router.get("/edit/:orderId/item/:itemId", isAdmin, (req, res) => {
  Order.findById(req.params.orderId, (err, order) => {
    if (err) console.log(err);

    const item = order.items.id(req.params.itemId);
    res.render("admin/edit_order_item", {
      order,
      item
    });
  });
});

router.post("/edit/:orderId/item/:itemId", isAdmin, (req, res) => {
  const { price, qty, vat } = req.body;

  Order.findById(req.params.orderId, (err, order) => {
    if (err) console.log(err);

    const item = order.items.id(req.params.itemId);
    item.price = price;
    item.qty = qty;
    item.vat = vat == "on" ? true : false;

    order.save();

    req.flash("success", "order item updated!");
    res.redirect("/admin/orders/" + req.params.orderId);
  });
});

router.get("/delete/:orderId/item/:itemId", isAdmin, (req, res) => {
  Order.findById(req.params.orderId, (err, order) => {
    if (err) console.log(err);

    const item = order.items.id(req.params.itemId);
    item.remove();
    order.save();

    req.flash("success", "Item deleted");
    res.redirect("/admin/orders/" + req.params.orderId);
  });
});

router.get("/invoice/:orderId", isAdmin, (req, res) => {
  let subTotal = 0;
  let vat = 0;
  Order.findById(req.params.orderId)
    .populate("user")
    .exec((err, order) => {
      if (err) console.log(err);
      order.items.map(item => {
        subTotal += item.qty * item.price;
      });
      vat = subTotal * 0.2;
      res.render("admin/invoice", {
        order,
        subTotal,
        vat,
        total: vat + subTotal
      });
    });
});

module.exports = router;
