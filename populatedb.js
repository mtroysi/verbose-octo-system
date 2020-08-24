#! /usr/bin/env node

console.log('This script populates some test categories and items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []

function categoryCreate(name, description, cb) {
  categorydetail = { name: name, description: description }
  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function itemCreate(name, description, category, price, number_in_stock, cb) {
  itemdetail = { 
    name: name,
    description: description,
    category: category,
    price: price,
    number_in_stock: number_in_stock,
  }
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Item: ' + item);
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}


function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate('Category 1', 'this is category 1', callback);
        },
        function(callback) {
          categoryCreate('Category 2', 'this is category 2', callback);
        },
        function(callback) {
          categoryCreate('Category 3', 'this is category 3', callback);
        },
        ],
        // optional callback
        cb);
}

function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Item 1', 'Description item 1', categories[0], 1, 1, callback)
        },
        function(callback) {
          itemCreate('Item 2', 'Description item 2', categories[0], 2, 1, callback)
        },
        function(callback) {
          itemCreate('Item 3', 'Description item 3', categories[0], 3, 1, callback)
        },
        function(callback) {
          itemCreate('Item 4', 'Description item 4', categories[0], 4, 2, callback)
        },
        function(callback) {
          itemCreate('Item 5', 'Description item 5', categories[1], 1, 3, callback)
        },
        function(callback) {
          itemCreate('Item 6', 'Description item 6', categories[1], 1, 4, callback)
        },
        function(callback) {
          itemCreate('Item 7', 'Description item 7', categories[1], 2, 5, callback)
        },
        function(callback) {
          itemCreate('Item 8', 'Description item 8', categories[1], 3, 1, callback)
        },
        function(callback) {
          itemCreate('Item 9', 'Description item 9', categories[2], 4, 2, callback)
        },
        function(callback) {
          itemCreate('Item 10', 'Description item 10', categories[2], 3, 2, callback)
        },
        function(callback) {
          itemCreate('Item 11', 'Description item 11', categories[2], 5, 1, callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createCategories,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Items: ' + items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




