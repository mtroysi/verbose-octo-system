var Item = require('../models/item');
var Category = require('../models/category');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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
  async.parallel({
    item: function(callback) {
      Item.findById(req.params.id)
        .populate('category')
        .exec(callback);
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.item==null) { // No results.
        var err = new Error('Item not found');
        err.status = 404;
        return next(err);
    }
    // Successful, so render.
    res.render('item_detail', { title: results.item.name, item: results.item } );
});
};

// Display Item create form on GET.
exports.item_create_get = function(req, res) {
  // Get all categories, which we can use for adding to our item.
  async.parallel({
    categories: function(callback) {
        Category.find(callback);
    },
  }, function(err, results) {
      if (err) { return next(err); }
      res.render('item_form', { title: 'Create Item', categories: results.categories });
  });
};

// Handle Item create on POST.
exports.item_create_post = [

  // Validate fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }),
  body('category', 'Category must not be empty.').trim().isLength({ min: 1 }),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }),
  body('price', 'Price must not be empty').trim().isLength({ min: 1 }),
  body('number_in_stock', 'Number in stock must not be empty').trim().isLength({ min: 1 }),

  // Sanitize fields (using wildcard).
  sanitizeBody('*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
      
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Item object with escaped and trimmed data.
      var item = new Item(
        { name: req.body.name,
          category: req.body.category,
          description: req.body.description,
          price: req.body.price,
          number_in_stock: req.body.number_in_stock
         });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.

          // Get all categories for form.
          async.parallel({
              categories: function(callback) {
                  Category.find(callback);
              },
          }, function(err, results) {
              if (err) { return next(err); }
              res.render('item_form', { title: 'Create Item', catgories: results.categories, item: item, errors: errors.array() });
          });
          return;
      }
      else {
          // Data from form is valid. Save item.
          item.save(function (err) {
              if (err) { return next(err); }
                 //successful - redirect to new item record.
                 res.redirect(item.url);
              });
      }
  }
];

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