const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Order = require('../models/order');

router.get('/', isAdmin, (req, res) => {
    Order.find((err, orders) => {

        res.render('admin/orders', {
            orders,
            count: orders.length
        });
    }).populate('user', 'name email').sort('date');

});

router.get('/:id', isAdmin, (req, res) => {

    Order.findById(req.params.id, (err, order) => {
        if (err) console.log(err);
        res.render('admin/order-items', {
            order
        });
    }).populate('user', 'name');
});

router.get('/user/:id', isAdmin, (req, res) => {
    Order.find({ "user": { "_id": req.params.id } }, (err, orders) => {
        if(err) console.log(err);
        res.render('admin/orders', {
            orders,
            count: orders.length
        });
    });
});

router.get('/delete/:id', isAdmin, (req, res) => {

    Order.findByIdAndDelete(req.params.id, (err) => {
        if(err) console.log(err);

        req.flash('success', 'order deleted!');
        res.redirect('/admin/orders/');
    });

});

router.get('/edit/:orderId/item/:itemId', isAdmin, (req, res) => {
    Order.findById(req.params.orderId, (err, order) => {
        if (err) console.log(err);

        const item = order.items.id(req.params.itemId);
        res.render('admin/edit-order-item', {
            order,
            item
        });
    });
});

router.post('/edit/:orderId/item/:itemId', isAdmin, (req, res) => {
    const { price, qty } = req.body;


    Order.findById(req.params.orderId, (err, order) => {
        if (err) console.log(err);

        const item = order.items.id(req.params.itemId);
        item.price = price;
        item.qty = qty;

        order.save();

        req.flash('success', 'order item updated!');
        res.redirect('/admin/orders/' + req.params.orderId);
    });

});

router.get('/delete/:orderId/item/:itemId', isAdmin, (req, res) => {
        
    Order.findById(req.params.orderId, (err, order) => {
        if(err) console.log(err);

        const item = order.items.id(req.params.itemId);
        item.remove();
        order.save();

        req.flash('success', 'Item deleted');
        res.redirect('/admin/orders/'+req.params.orderId)
    });

});

module.exports = router;
