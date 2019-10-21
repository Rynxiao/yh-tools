const express = require('express');
const shell = require('shelljs');
const { parseSiteStringToJson } = require('../utils');

const router = express.Router();

const getList = (url) => {
  console.log('request url', url);
  const annieProcess = shell.exec(`annie -i -p ${decodeURIComponent(url)}`, { silent: true });
  const { code, stdout, stderr } = annieProcess;
  console.log('code', code);
  console.log('stdout', stdout);
  console.log('stderr', stderr);

  if (stderr) {
    return { hasError: true, msg: stderr };
  }

  if (code === 0) {
    const siteJson = parseSiteStringToJson(stdout, url);
    console.log(JSON.stringify(siteJson));
    return { hasError: false, list: siteJson };
  }
  return { hasError: true, msg: stdout };
};

router.get('/list', (req, res) => {
  const url = req.query.request_url;
  const result = getList(url);

  if (result.hasError) {
    res.json({ code: 400, msg: result.msg });
  } else {
    res.json({
      code: 200,
      data: { list: result.list },
    });
  }
});

module.exports = router;
