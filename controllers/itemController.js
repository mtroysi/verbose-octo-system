var Item = require('../models/item');
var Category = require('../models/category');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

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
          number_in_stock: req.body.number_in_stock,
          image: req.file ? req.file.filename : undefined,
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
              res.render('item_form', { title: 'Create Item', categories: results.categories, item: item, errors: errors.array() });
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
  async.parallel({
    item: function(callback) {
        Item.findById(req.params.id).exec(callback);
    },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.item==null) { // No results.
          res.redirect('/catalog/items');
      }
      // Successful, so render.
      res.render('item_delete', { title: 'Delete Item', item: results.item } );
  });
};

// Handle Item delete on POST.
exports.item_delete_post = function(req, res) {
  async.parallel({
    item: function(callback) {
        Item.findById(req.body.itemid).exec(callback);
    },
}, function(err, results) {
    if (err) { return next(err); }
    // Success
    // Delete object and redirect to the list of items.
    Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
        if (err) { return next(err); }
        // Success - go to item list
        res.redirect('/catalog/items')
    })
});
};

// Display Item update form on GET.
exports.item_update_get = function(req, res) {
        // Get item and categories for form.
        async.parallel({
          item: function(callback) {
              Item.findById(req.params.id).populate('category').exec(callback);
          },
          categories: function(callback) {
              Category.find(callback);
          },
          }, function(err, results) {
              if (err) { return next(err); }
              if (results.item==null) { // No results.
                  var err = new Error('Item not found');
                  err.status = 404;
                  return next(err);
              }
              // Success.
              res.render('item_form', { title: 'Update Item', item: results.item, categories: results.categories });
          });
};

// Handle Item update on POST.
exports.item_update_post = [
 
  // Validate fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }),
  body('category', 'Category must not be empty.').trim().isLength({ min: 1 }),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }),
  body('price', 'Price must not be empty').trim().isLength({ min: 1 }),
  body('number_in_stock', 'Number in stock must not be empty').trim().isLength({ min: 1 }),

  // Sanitize fields.
  sanitizeBody('*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Item object with escaped/trimmed data and old id.
      var item = new Item(
        { name: req.body.name,
          category: req.body.category,
          description: req.body.description,
          price: req.body.price,
          number_in_stock: req.body.number_in_stock,
          image: req.file ? req.file.filename : undefined,
          _id:req.params.id //This is required, or a new ID will be assigned!
         });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.

          // Get all authors and genres for form.
          async.parallel({
            categories: function(callback) {
                Category.find(callback);
            },
          }, function(err, results) {
              if (err) { return next(err); }
              res.render('item_form', { title: 'Update Item', categories: results.categories, item: item, errors: errors.array() });
          });
          return;
      }
      else {
          // Data from form is valid. Update the record.
          Item.findByIdAndUpdate(req.params.id, item, {}, function (err,theitem) {
              if (err) { return next(err); }
                 // Successful - redirect to item detail page.
                 res.redirect(theitem.url);
              });
      }
  }
];