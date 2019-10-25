import uuidv1 from 'uuid/v1';

const clientId = uuidv1();
let videoMap = null;
let downloadMap = null;

function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

function videoListToMap(videoList) {
  const vMap = new Map();
  downloadMap = new Map();
  videoList.forEach((video) => {
    const { title, id } = video;
    const streams = video.stream;
    streams.forEach((stream) => {
      const { size } = stream;
      const cid = stream.id;
      vMap.set(`${id}-${cid}`, `${title}-${size}`);
      downloadMap.set(`${id}-${cid}`, { stream, row: video });
    });
  });
  return vMap;
}

function getVideoInfoInMap(videoList, id) {
  if (!videoMap) {
    videoMap = videoListToMap(videoList);
  }
  return videoMap.get(id);
}

function getVideoInfoByConnectionId(connectionId) {
  if (downloadMap) {
    return downloadMap.get(connectionId);
  }
  return {};
}

export {
  clientId,
  trim,
  getVideoInfoInMap,
  getVideoInfoByConnectionId,
};
