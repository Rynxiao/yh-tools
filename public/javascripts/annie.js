const downloadProcessMaps = new Map();
const shell = require('shelljs');
const { spawn } = require('child_process');
const downloadsFolder = require('downloads-folder');
const { parseSiteStringToJson, throttle } = require('./index');
const logger = require('./logger');
const WsClient = require('./websocket/websocket.client');

let isDownloading = false;

// eslint-disable-next-line no-unused-vars
function makeFakeDownload(ws, params) {
  // eslint-disable-next-line camelcase
  const { parent_id, child_id, client_id } = params;
  let progress1 = 0;
  const inter = setInterval(() => {
    WsClient.send(ws, {
      speed: '1.04 MiB/s',
      progress: progress1,
      remain: '00m34s',
      parent_id,
      child_id,
      client_id,
    });
    if (progress1 >= 100) {
      clearInterval(inter);
    }
    progress1 += Math.random() * 3 + 5;
  }, 1000);
}

function getDownloadInfo(chunk, ws, params) {
  // eslint-disable-next-line camelcase
  const { parent_id, child_id, client_id } = params;
  if (isDownloading && chunk) {
    const data = chunk.toString();
    // eslint-disable-next-line no-useless-escape
    const downloadInfo = data.match(/(?<=\[[^\]]+?\])(?:\s*([\d\.]+?\s*%))(?:\s*([\d\.]+?\s*MiB\/s))(?:\s*(.*))/);
    if (downloadInfo) {
      const progress = downloadInfo[1];
      const speed = downloadInfo[2];
      const remain = downloadInfo[3];

      WsClient.send(ws, {
        speed,
        progress,
        remain,
        parent_id,
        child_id,
        client_id,
      });
    }
  } else {
    logger.info(`[server annie download] chunk === undefined: ${chunk === undefined}, download completed`);
    WsClient.send(ws, {
      speed: '0',
      progress: '100',
      remain: '0',
      parent_id,
      child_id,
      client_id,
    });
  }
}

const AnnieDownloader = {
  getVideoList(url) {
    return new Promise((resolve) => {
      logger.info('[server annie list] get video request url', url);
      const annieProcess = shell.exec(`annie -i -p ${decodeURIComponent(url)}`, { silent: true });
      const { code, stdout, stderr } = annieProcess;
      logger.info('[server annie list] code', code);
      logger.info('[server annie list] stderr', stderr);

      if (stderr) {
        resolve({ hasError: true, msg: 'please input valid search url', error: stderr });
      }

      if (code === 0) {
        const siteJson = parseSiteStringToJson(stdout, url);
        logger.info(`[server annie list] video list ${JSON.stringify(siteJson)}`);
        resolve({ hasError: false, list: siteJson });
      }
      resolve({ hasError: true, msg: stdout });
    });
  },
  async download(connectionId, params) {
    logger.info(`[server annie download] connectionId:${connectionId}, params: ${JSON.stringify(params)}`);
    const { code, url, filename } = params;
    const ws = await WsClient.connect(connectionId);
    let downloadSuccess = true;

    const downloadCommand = `annie -n 1 -o ${downloadsFolder()} -O ${filename} -f ${code} ${url}`;
    // const downloadProcess = shell.exec(downloadCommand, { async: true });
    const downloadProcess = spawn('annie', ['-n', '1', '-o', downloadsFolder(), '-O', filename, '-f', code, url]);

    logger.info(`[server annie download] download command: ${downloadCommand}`);
    downloadProcessMaps.set(connectionId, downloadProcess);
    isDownloading = true;

    downloadProcess.stderr.on('data', () => {
      downloadSuccess = false;
    });

    downloadProcess.stdout.on('data', throttle((chunk) => {
      try {
        if (!chunk) {
          isDownloading = false;
        }
        getDownloadInfo(chunk, ws, params);
      } catch (e) {
        downloadSuccess = false;
        WsClient.close(params.client_id, connectionId, 'download error');
        this.stop(connectionId);
        logger.error(`[server annie download] error: ${e}`);
      }
    }, 500, 300));

    return downloadSuccess;
  },
  stop(connectionId) {
    const process = downloadProcessMaps.get(connectionId);
    downloadProcessMaps.delete(connectionId);
    logger.info(`[server annie stop] download process ${connectionId} ready to shut down`);
    process.kill('SIGINT');
  },
};

module.exports = AnnieDownloader;
