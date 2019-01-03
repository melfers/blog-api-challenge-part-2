"use strict";

const mongoose = require("mongoose");

// this is our schema to represent a blog post
const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    firstName: String,
    // coord will be an array of string values
    lastName: String
  }
});

postSchema.virtual("authorString").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

postSchema.methods.serialize = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.authorString,
    created: this.created
  };
};



const Post = mongoose.model("Post", postSchema);