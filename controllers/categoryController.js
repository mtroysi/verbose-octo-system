var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Categories.
exports.category_list = function(req, res) {
    Category.find({})
    .sort([['name', 'ascending']])
    .exec(function (err, list_categories) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('category_list', { title: 'Category List', category_list: list_categories });
    });
};

// Display detail page for a specific Category.
exports.category_detail = function(req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback)
        },
        category_items: function(callback) {
          Item.find({ 'category': req.params.id },'name description')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items } );
    });
};

// Display Category create form on GET.
exports.category_create_get = function(req, res) {
    res.render('category_form', { title: 'Create Category' });
};

// Handle Category create on POST.
exports.category_create_post = [

    // Validate fields.
    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.'),
    body('description').isLength({ min: 1 }).trim().withMessage('Description must be specified.'),

    // Sanitize fields.
    sanitizeBody('name').escape(),
    sanitizeBody('description').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('category_form', { title: 'Create Category', category: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create a Category object with escaped and trimmed data.
            var category = new Category(
                {
                    name: req.body.name,
                    description: req.body.description,
                });
            category.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new category record.
                res.redirect(category.url);
            });
        }
    }
];

// Display Category delete form on GET.
exports.category_delete_get = function(req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        category_items: function(callback) {
          Item.find({ 'category': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            res.redirect('/catalog/categories');
        }
        // Successful, so render.
        res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items } );
    });
};

// Handle Category delete on POST.
exports.category_delete_post = function(req, res) {
    async.parallel({
        category: function(callback) {
          Category.findById(req.body.categoryid).exec(callback)
        },
        category_items: function(callback) {
          Item.find({ 'category': req.body.categoryid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.category_items.length > 0) {
            // Category has items. Render in same way as for GET route.
            res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items } );
            return;
        }
        else {
            // Category has no items. Delete object and redirect to the list of categories.
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err); }
                // Success - go to category list
                res.redirect('/catalog/categories')
            })
        }
    });
};

// Display Category update form on GET.
exports.category_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Category update GET');
};

// Handle Category update on POST.
exports.category_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Category update POST');
};