import { all, fork } from 'redux-saga/effects';
import axios from 'axios';

import postSaga from './post';
import userSaga from './user';
//import { backUrl } from '../config/config';

// axios.defaults.baseURL = backUrl;
// axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3065';  // 기본요청 url 설정
axios.defaults.withCredentials = true;  // 쿠키 http요청에 포함시킬건지 설정

export default function* rootSaga() {
  yield all([
    fork(postSaga),
    fork(userSaga),
  ]);
}
