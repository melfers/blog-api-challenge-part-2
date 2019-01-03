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

