const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts
      });
    })
    .catch(err => {
      if (!statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect"); // error.message is a property that will contain the message by default.
    error.statusCode = 422; // Add a custom property (any name) to your error object
    throw error;

    // throw error instead of
    // return res.status(422).json({
    //   message: "Validation failed, entered data is incorrect.",
    //   errors: errors.array()
    // });
  }

  const title = req.body.title;
  const content = req.body.content;
  // console.log(title, content);

  const post = new Post({
    title: title,
    content: content,
    imageUrl: "../images/boat.png",
    creator: { name: "Bart" }
  });

  post
    .save()
    .then(result => {
      // console.log("createPost", result);

      res.status(201).json({
        message: "Post created successfully!",
        post: result
      });
    })
    .catch(err => {
      // console.log(err)
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      // thorw err - Remember throwing error inside async code will not fire the overall error handler.  You have to pass the err.
      next(err);
    });

  // res.status(201).json({
  //   message: "Post created successfully!",
  //   post: {
  //     _id: new Date().toISOString(),
  //     title: title,
  //     content: content,
  //     creator: { name: "Bart" },
  //     createdAt: new Date()
  //   }
  // });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "Post fetched",
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
