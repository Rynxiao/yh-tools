const express = require('express');
const shell = require('shelljs');
const WebSocketClient = require('websocket').client;
const { parseSiteStringToJson } = require('../utils');
const list = require('../mock/list');
const CONFIG = require('../build/config');
const WsClient = require('../utils/websocket.client');

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
  // const url = req.query.request_url;
  // const result = getList(url);
  //
  // if (result.hasError) {
  //   res.json({ code: 400, msg: result.msg });
  // } else {
  //   res.json({
  //     code: 200,
  //     data: { list: result.list },
  //   });
  // }
  res.json(list);
});

router.get('/download', async (req, res) => {
  const { code } = req.query;
  const url = req.query.request_url;
  const clientId = req.query.client_id;
  const parentId = req.query.parent_id;
  const childId = req.query.child_id;
  const connectionId = `${parentId}-${childId}`;

  const ws = await WsClient.connect(connectionId);
  function makeProgress() {
    let progress = 0;
    const inter = setInterval(() => {
      if (progress >= 100) {
        progress = 100;
        clearInterval(inter);
      }
      WsClient.send(ws, {
        progress,
        parent_id: parentId,
        child_id: childId,
        client_id: clientId,
      });
      progress += Math.random() * 2 + 5;
    }, 300);
  }

  makeProgress();
  res.json({ code: 200 });
});

router.get('/close/:id/:browser_client_id', (req, res) => {
  const connectionId = req.params.id;
  const browserClientId = req.params.browser_client_id;
  console.log(`[server router] /close/${connectionId}/${browserClientId}`);
  WsClient.close(browserClientId, connectionId, 'stop by manully');
  res.json({ code: 200 });
});

module.exports = router;
