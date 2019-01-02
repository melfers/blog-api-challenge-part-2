const express = require("express");
const morgan = require("morgan");

const bprouter = require("./blogPostsRouter");

const app = express();

app.use(morgan("common"));
app.use(express.json());

let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve(server);
      })
      .on("error", err => {
        reject(err);
      });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log("Closing server");
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

// you need to import `blogPostsRouter` router and route

// requests to HTTP requests to `/blog-posts` to `blogPostsRouter`
app.use('/blog-posts', bprouter);

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };

