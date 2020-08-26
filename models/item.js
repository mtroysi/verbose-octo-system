var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    name: {type: String, required: true, maxlength: 100},
    description: {type: String, required: true, maxlength: 500},
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
    price: {type: Number, required: true},
    number_in_stock: {type: Number, required: true},
    image: {type: String}
  }
);

// Virtual for author's URL
ItemSchema
.virtual('url')
.get(function () {
  return '/catalog/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);