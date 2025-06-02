// [store] - configureStore.js
import React from 'react';
import { createWrapper } from 'next-redux-wrapper';
import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from '../reducers/index.js';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];  //##

  // middleware 적용 방식 수정
  const enhancer = process.env.NODE_ENV === 'production' ?
    compose([...middlewares]) :
    composeWithDevTools(applyMiddleware(...middlewares))

  const store = createStore(reducer, enhancer);

  store.sagaTask = sagaMiddleware.run(rootSaga);  //##
  return store;
};
const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === 'development',
});
export default wrapper;
