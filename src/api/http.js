import axios from 'axios';
import qs from 'qs';

axios.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

axios.interceptors.response.use((response) => response, (error) => Promise.resolve(error.response));

function checkStatus(response) {
  console.log(`[client http] request result ${JSON.stringify(response)}`);
  // 如果http状态码正常，则直接返回数据
  if (response && (response.status === 200 || response.status === 304)) {
    return response;
    // 如果不需要除了data之外的数据，可以直接 return response.data
  }
  // 异常状态下，把错误信息返回去
  return { data: { code: 500, msg: '服务器请求错误' } };
}

function checkCode(res) {
  // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
  if (res.status === 400) {
    console.error(res.msg);
  }
  return res;
}

const isDev = process.env.NODE_ENV === 'development';

export default {
  post(url, data) {
    return axios({
      method: 'post',
      baseURL: `http://localhost:8888/api/`,
      url,
      data: qs.stringify(data),
      timeout: 10000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    }).then(
      (response) => checkStatus(response),
    ).then(
      (res) => checkCode(res),
    );
  },
  get(url, params) {
    return axios({
      method: 'get',
      baseURL: `http://localhost:8888/api/`,
      url,
      params, // get 请求时带的参数
      timeout: 10000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    }).then(
      (response) => checkStatus(response),
    ).then(
      (res) => checkCode(res),
    );
  },
};
