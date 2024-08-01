// server/models/SavedArticle.js

const mongoose = require('mongoose');

const SavedArticleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true },
  urlToImage: { type: String }
});

module.exports = mongoose.model('SavedArticle', SavedArticleSchema);
