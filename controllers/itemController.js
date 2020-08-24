var Item = require('../models/item');
var Category = require('../models/category');
var async = require('async');

exports.index = function(req, res) {
  async.parallel({
    item_count: function(callback) {
        Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
    },
    categories_count: function(callback) {
        Category.countDocuments({}, callback);
    }
}, function(err, results) {
    res.render('index', { title: 'Inventory Home', error: err, data: results });
});
};

// Display list of all Items.
exports.item_list = function(req, res) {
  Item.find({})
  .populate('category')
  .exec(function (err, list_items) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('item_list', { title: 'Item List', item_list: list_items });
  });
};

// Display detail page for a specific Item.
exports.item_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Item detail: ' + req.params.id);
};

// Display Item create form on GET.
exports.item_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Item create GET');
};

// Handle Item create on POST.
exports.item_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Item create POST');
};

// Display Item delete form on GET.
exports.item_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Item delete GET');
};

// Handle Item delete on POST.
exports.item_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Item delete POST');
};

// Display Item update form on GET.
exports.item_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Item update GET');
};

// Handle Item update on POST.
exports.item_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Item update POST');
};