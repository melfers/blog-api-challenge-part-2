const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bprouter = require("./blogPostsRouter");

const { PORT, DATABASE_URL } = require("./config");
const { Restaurant } = require("./models");

const app = express();

mongoose.Promise = global.Promise;

app.use(morgan("common"));
app.use(express.json());

// GET requests to /restaurants => return 10 restaurants
app.get("/blog-posts", (req, res) => {
  Post.find()
    .limit(10)
    // success callback: for each restaurant we got back, we'll
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.    
    .then(posts => {
      res.json({
        posts: posts.map(post => post.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.get("/blog-posts/:id", (req, res) => {
  Post
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.post("/blog-posts", (req, res) => {
  const requiredFields = ["title", "content", "author"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Post.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
    .then(post => res.status(201).json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// you need to import `blogPostsRouter` router and route

// requests to HTTP requests to `/blog-posts` to `blogPostsRouter`
app.use('/blog-posts', bprouter);

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };

