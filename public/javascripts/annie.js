const downloadProcessMaps = new Map();
const shell = require('shelljs');
const downloadsFolder = require('downloads-folder');
const { parseSiteStringToJson } = require('./utils');
const WsClient = require('./utils/websocket.client');

function getDownloadInfo(data, ws, params) {
  if (data) {
    const downloadInfo = data
      // eslint-disable-next-line no-useless-escape
      .match(/(?<=\[[^\]]+?\])(?:\s*([\d\.]+?\s*%))(?:\s*([\d\.]+?\s*MiB\/s))(?:\s*(.*))/);
    if (downloadInfo) {
      const progress = downloadInfo[1];
      const speed = downloadInfo[2];
      const remain = downloadInfo[3];
      // eslint-disable-next-line camelcase
      const { parent_id, child_id, client_id } = params;

      WsClient.send(ws, {
        speed,
        progress,
        remain,
        parent_id,
        child_id,
        client_id,
      });

      let downloadTimeout;
      if (progress >= 100) {
        if (downloadTimeout) {
          clearTimeout(downloadTimeout);
        }
      }
      downloadTimeout = setTimeout(getDownloadInfo, 4000);
    }
  }
}

const AnnieDownloader = {
  getVideoList(url) {
    return new Promise((resolve) => {
      console.log('[server annie list] get video request url', url);
      const annieProcess = shell.exec(`annie -i -p ${decodeURIComponent(url)}`, { silent: true });
      const { code, stdout, stderr } = annieProcess;
      console.log('[server annie list] code', code);
      console.log('[server annie list] stderr', stderr);

      if (stderr) {
        resolve({ hasError: true, msg: 'please input valid search url', error: stderr });
      }

      if (code === 0) {
        const siteJson = parseSiteStringToJson(stdout, url);
        console.log(`[server annie list] video list ${JSON.stringify(siteJson)}`);
        resolve({ hasError: false, list: siteJson });
      }
      resolve({ hasError: true, msg: stdout });
    });
  },
  async download(connectionId, params) {
    console.log(`[server annie download] connectionId:${connectionId}, params: ${JSON.stringify(params)}`);
    const { code, url } = params;
    const ws = await WsClient.connect(connectionId);
    let downloadSuccess = true;

    const downloadCommand = `annie -o ${downloadsFolder()} -f ${code} ${url}`;
    const downloadProcess = shell.exec(downloadCommand, { async: true });
    console.log(`[server annie download] download command: ${downloadCommand}`);
    downloadProcessMaps.set(connectionId, downloadProcess);

    downloadProcess.stderr.on('data', () => {
      downloadSuccess = false;
    });

    downloadProcess.stdout.on('data', (data) => {
      // console.log(`[server annie download] stdout: ${data}`);
      try {
        getDownloadInfo(data, ws, params);
      } catch (e) {
        downloadSuccess = false;
        WsClient.close(params.client_id, connectionId, 'download error');
        this.stop(connectionId);
        console.error(`[server annie download] error: ${e}`);
      }
    });
    return downloadSuccess;
  },
  stop(connectionId) {
    const process = downloadProcessMaps.get(connectionId);
    downloadProcessMaps.delete(connectionId);
    console.log(`[server annie stop] download process ${connectionId} ready to shut down`);
    process.kill('SIGINT');
  },
};

module.exports = AnnieDownloader;
