const axios = require('axios');
const ejs = require('ejs');
const uuid1 = require('uuid/v1');
const CONFIG = require('../build/config');

const isDev = process.env.NODE_ENV === 'development';

function getTemplateString(filename) {
  return new Promise((resolve, reject) => {
    axios.get(`http://localhost:${CONFIG.PORT}${CONFIG.PATH.PUBLIC_PATH}${CONFIG.DIR.VIEW}/${filename}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}

/**
 * render 方法
 * @param res express 的 res 对象
 * @param filename 需要渲染的文件名
 * @param data ejs 渲染时需要用到的附加对象
 * @returns {Promise<*|undefined>}
 */
async function render(res, filename, data) {
  // 文件后缀
  const ext = '.ejs';
  let fName = filename;
  fName = fName.indexOf(ext) > -1 ? fName.split(ext)[0] : fName;
  try {
    if (isDev) {
      const template = await getTemplateString(`${fName}.ejs`);
      const html = ejs.render(template, data);
      res.send(html);
    } else {
      res.render(fName, data);
    }
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

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

module.exports = {
  parseSiteStringToJson,
  render,
};
