var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: {type: String, required: true, maxlength: 100},
    description: {type: String, required: true, maxlength: 500},
  }
);

// Virtual for author's URL
CategorySchema
.virtual('url')
.get(function () {
  return '/catalog/category/' + this._id;
});

//Export model
module.exports = mongoose.model('Category', CategorySchema);