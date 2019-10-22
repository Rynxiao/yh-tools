import uuidv1 from 'uuid/v1';

const clientId = uuidv1();
let videoMap = null;

function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

function videoListToMap(videoList) {
  const vMap = new Map();
  videoList.forEach((video) => {
    const { title, id } = video;
    const streams = video.stream;
    streams.forEach((stream) => {
      const { size } = stream;
      const cid = stream.id;
      vMap.set(`${id}-${cid}`, `${title}-${size}`);
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

export {
  clientId,
  trim,
  getVideoInfoInMap,
};
