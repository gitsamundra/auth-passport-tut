const express = require('express');

const usersRouter = express.Router();


usersRouter.get('/', (req, res) => {
  res.send('User route')
})
module.exports = usersRouter;