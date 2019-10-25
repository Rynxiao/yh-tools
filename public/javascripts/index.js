const uuid1 = require('uuid/v1');

function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

function parseSiteStringToJson(siteString, url) {
  const data = [];
  const list = siteString.replace(/\n\s*(?=Site)/, '').split('Site:');
  list.forEach((item, index) => {
    if (item) {
      const site = trim(item.match(/\s*(.*)?\n\s*(?=Title)/)[1]);
      const title = trim(item.match(/Title:\s*(.*)?\n/)[1]);
      const type = trim(item.match(/Type:\s*(.*)?\n/)[1]);
      const streams = item.match(/Streams:\s*((.|\n)*)/)[1];
      const siteInfo = {};
      siteInfo.id = uuid1();
      siteInfo.key = `${index}`;
      siteInfo.site = site;
      siteInfo.title = title;
      siteInfo.type = type;
      siteInfo.stream = [];
      const streamList = streams.split(/\[(\d+|default)\]\s*\-*\n/);
      streamList.forEach((stream, childIndex) => {
        if (stream.includes('Quality')) {
          const streamInfo = {};
          const quality = trim(stream.match(/Quality:\s*(.*)?\n/)[1]);
          let size = stream.match(/Size:\s*(.*)?\n/)[1];
          size = trim(size.replace(/\(.*?\)/, ''));
          let downloadUrl = trim(stream.match(/download with:\s*(.*)?\n/)[1]);
          downloadUrl = downloadUrl.replace('...', url);
          streamInfo.id = uuid1();
          streamInfo.key = `${index}${childIndex}`;
          streamInfo.quality = quality;
          streamInfo.size = size;
          streamInfo.url = downloadUrl;
          siteInfo.stream.push(streamInfo);
        }
      });
      data.push(siteInfo);
    }
  });
  return data;
}

function debounce(func, wait, immediate) {
  let timeout;
  return (...args) => {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function throttle(func, wait, mustRun) {
  let timeout;
  let startTime = new Date();

  return (...args) => {
    const context = this;
    const curTime = new Date();

    clearTimeout(timeout);
    // 如果达到了规定的触发时间间隔，触发 handler
    if (curTime - startTime >= mustRun) {
      func.apply(context, args);
      startTime = curTime;
      // 没达到触发间隔，重新设定定时器
    } else {
      timeout = setTimeout(func, wait);
    }
  };
}

module.exports = {
  parseSiteStringToJson,
  throttle,
  debounce,
};
