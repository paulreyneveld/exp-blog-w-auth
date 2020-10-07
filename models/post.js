const mongoose = require('mongoose');

const Schema = mongoose.Schema;

PostSchema = new Schema(
    {
        content: { type: String },
        author: { type: String },
    },
    { 
      timestamps: { createdAt: 'created_at' } 
    }
);

PostSchema
.virtual('url')
.get(function () {
  return '/post/' + this._id;
});

module.exports = mongoose.model('Post', PostSchema);