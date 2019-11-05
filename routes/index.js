const express = require('express');
const { render } = require('../public/javascripts/render');

const router = express.Router();

router.get('*', async (req, res, next) => {
  const url = req.originalUrl;
  if (url.includes('api')) {
    return next();
  }
  try {
    return await render(res, 'index');
  } catch (e) {
    return next(e);
  }
});


module.exports = router;
