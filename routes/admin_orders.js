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

router.get('/:id', async (req, res) => {
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

router.get('/user/:id', async (req, res) => {
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

module.exports = router;
