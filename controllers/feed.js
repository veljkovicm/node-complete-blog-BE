exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      _id: '1',
      title: 'First Post',
      content: 'This is the first post!',
      imageUrl: 'images/legcat.jpg',
      creator: {
        name: 'John Smith'
      },
      createdAt: new Date()
    }]
  });
};

exports.createPost = (req, res, next) => {
  const { title, content } = req.body;
  // Create post in db
  res.status(201).json({
    message: 'Post created successfully!',
    post: {id: Date.now(), title: title, content: content }
  });
};