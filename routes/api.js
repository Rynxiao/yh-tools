const express = require('express');
const WsClient = require('../public/javascripts/utils/websocket.client');
const AnnieDownloader = require('../public/javascripts/annie');

const router = express.Router();

router.get('/list', async (req, res) => {
  const url = req.query.request_url;
  const result = await AnnieDownloader.getVideoList(url);
  console.log(`[server request list] request result ${JSON.stringify(result)}`);

  if (result.hasError) {
    res.json({ code: 400, msg: result.msg });
  } else {
    res.json({
      code: 200,
      data: { list: result.list },
    });
  }
});

router.get('/download', async (req, res) => {
  const { code } = req.query;
  const url = req.query.download_url;
  const clientId = req.query.client_id;
  const parentId = req.query.parent_id;
  const childId = req.query.child_id;
  const connectionId = `${parentId}-${childId}`;

  const params = {
    code,
    url,
    parent_id: parentId,
    child_id: childId,
    client_id: clientId,
  };

  const flag = await AnnieDownloader.download(connectionId, params);
  if (flag) {
    await res.json({ code: 200 });
  } else {
    await res.json({ code: 500, msg: 'download error' });
  }
});

router.get('/close/:id/:browser_client_id', (req, res) => {
  const connectionId = req.params.id;
  const browserClientId = req.params.browser_client_id;
  console.log(`[server router] /close/${connectionId}/${browserClientId}`);
  AnnieDownloader.stop(connectionId);
  WsClient.close(browserClientId, connectionId, 'stop by manually');
  res.json({ code: 200 });
});

module.exports = router;
