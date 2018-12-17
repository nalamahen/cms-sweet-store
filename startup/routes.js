
const pages = require('../routes/pages.js');
const products = require('../routes/products.js');
const cart = require('../routes/cart.js');
const users = require('../routes/users.js');
const adminPages = require('../routes/admin_pages.js');
const adminBrands = require('../routes/admin_brands.js');
const adminBrandImages = require('../routes/admin_brand_images.js');
const adminCategories = require('../routes/admin_categories.js');
const adminCategoryImages = require('../routes/admin_category_images.js');
const adminProducts = require('../routes/admin_products.js');
const adminPromotions = require('../routes/admin_promotions.js');
const adminOrders = require('../routes/admin_orders.js');

module.exports = function (app) {
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
}