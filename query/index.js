const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { default: axios } = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  const { id, title, postId, content, status } = data;
  const post = posts[postId];
  switch (type) {
    case "PostCreated":
      posts[id] = { id, title, comments: [] };
      break;
    case "CommentCreated":
      post.comments.push({ id, content, status });
      break;
    case "CommentUpdated":
      const comment = post.comments.find((comment) => {
        return comment.id === id;
      });

      comment.status = status;
      comment.content = content;
      break;
    default:
      break;
  }
};

app.get("/posts", (_req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

app.listen(4002, async () => {
  console.log("Lisening on 4002");
  const res = await axios.get("http://event-bus-srv:4005/events");
  for (const event of res.data) {
    console.log("Processing event:", event.type);
    handleEvent(event.type, event.data);
  }
});
