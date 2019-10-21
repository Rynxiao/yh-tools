const express = require('express');
const { render } = require('../utils');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    await render(res, 'index');
  } catch (e) {
    next(e);
  }
});

module.exports = router;
