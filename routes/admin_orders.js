const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Order = require('../models/order');

router.get('/', isAdmin, async (req, res) => {
    try {        
        const orders = await Order.find()
            .populate('user', 'name email')        
            .sort('date');
        res.render('admin/orders', {
            orders,
            count: orders.length            
        });
    } catch (error) {        
        res.render('admin/admin-error', {
            error: 'Failed to load orders:' + error
        });
    }

});

router.get('/:id', isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name')      
        res.render('admin/order-items', {
            order          
        });
    } catch (error) {
        res.render('admin/admin-error', {
            error: 'Failed to load order for id:' + error
        });
        
    }
});

router.get('/user/:id', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find({"user": {"_id": req.params.id}});                                                  
        res.render('admin/orders', {
            orders,
            count: orders.length          
        });
    } catch (error) {
        res.render('admin/admin-error', {
            error: 'Failed to load order for user:' + error
        });
        
    }
});

router.get('/delete/:id', isAdmin, async (req, res) => {
    try {
            await Order.findByIdAndDelete(req.params.id);

            req.flash('success', 'order deleted!');
            res.redirect('/admin/orders/');
    } catch (error) {
        res.render('admin/admin-error', {
            error: 'Failed to delete the order: ' + error 
        });
    }
});

router.get('/edit/:orderId/item/:itemId', isAdmin, async (req, res) =>{
    try {
        const order = await Order.findById(req.params.orderId);
        const item = order.items.id(req.params.itemId);

        res.render('admin/edit-order-item', {
            order,
            item
        });
    } catch (error) {
        res.render('admin/admin-error', {
            error: 'Failed to load item: ' + error 
        });
    }
});

router.post('/edit/:orderId/item/:itemId', isAdmin, async (req, res) => {
    const { price, qty } = req.body;
    try {
        
        const order = await Order.findById(req.params.orderId);
        const item = order.items.id(req.params.itemId);
        item.price = price;
        item.qty = qty;

        order.save();

        req.flash('success', 'order item updated!');
        res.redirect('/admin/orders/'+ req.params.orderId);
        
    } catch (error) {
        res.render('admin/admin-error', {
            error: 'Failed to update item: ' + error 
        });
    }

});

router.get('/delete/:orderId/item/:itemId', isAdmin, async (req, res) => {
    try {
        
        const order = await Order.findById(req.params.orderId);
        const item = order.items.id(req.params.itemId);
        item.remove();
        order.save();

        req.flash('success', 'Item deleted');
        res.redirect('/admin/orders/'+req.params.orderId)
    } catch (error) {
        res.render('admin/admin-error', {
            error: 'Failed to delete item: ' + error 
        });
    }
});

module.exports = router;
