import React, { useState, useCallback, useEffect } from 'react';  //##

import Head from 'next/head';
import AppLayout from '../components/AppLayout'
import { Form, Input, Button, Checkbox } from 'antd';
import styled from 'styled-components';
import userInput from '../hooks/userInput';

import Router from 'next/router';
import axios from 'axios'; //##
import { END } from 'redux-saga'; //##

import { useDispatch, useSelector } from 'react-redux';
import { LOAD_MY_INFO_REQUEST, SIGN_UP_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

const ErrorMessage = styled.div`color:red;`;   //style.div( color:red; )

//--
const Signup = () => {
  const { signUpLoading, signUpDone, signUpError, user } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => { if (user && user.id) { Router.replace('/'); } }, [user && user.id]);
  useEffect(() => { if (signUpDone) { Router.replace('/'); } }, [signUpDone]);
  useEffect(() => { if (signUpError) { alert(signUpError); } }, [signUpError]);


  /////////////////////////////////// code
  const [email, onChangeEmail] = userInput('');
  const [nickname, onChangeNickname] = userInput('');
  const [password, onChangePassword] = userInput('');

  const [passwordRe, setChangePasswordRe] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const onChangePasswordRe = useCallback((e) => {
    setChangePasswordRe(e.target.value);
    setPasswordError(e.target.value !== password);
  }, [password]);

  const [check, setCheck] = useState('');
  const [checkError, setCheckError] = useState(false);
  const onChangeCheck = useCallback((e) => {
    ;
    setCheck(e.target.checked);
    setCheckError(false);
  }, []);

  const onSubmitForm = useCallback(() => {
    if (password !== passwordRe) { return setPasswordError(true); }
    if (!check) { setCheckError(true); }

    return dispatch({
      type: SIGN_UP_REQUEST,
      data: { email, password, nickname }
    });
  }, [email, password, passwordRe, check]);

  /////////////////////////////////// view
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title> Signup | TheJoa </title>
      </Head>
      <AppLayout>
        <Form layout='vertical' style={{ margin: '2%' }} onFinish={onSubmitForm}  >
          <Form.Item>
            <label htmlFor='email'>아이디</label>
            <Input placeholder='user@email.com' id='email'
              value={email} onChange={onChangeEmail} name='email' required />
          </Form.Item>
          <Form.Item>
            <label htmlFor='nickname'>닉네임</label>
            <Input placeholder='닉네임을 작성해주세요' id='nickname'
              value={nickname} onChange={onChangeNickname} name='nickname' required />
          </Form.Item>
          <Form.Item>
            <label htmlFor='password'>비밀번호</label>
            <Input.Password placeholder='비밀번호입력' id='password'
              value={password} onChange={onChangePassword} name='password' required />
          </Form.Item>
          <Form.Item>
            <label htmlFor='password-re'>비밀번호 체크</label>
            <Input.Password placeholder='비밀번호입력 체크' id='password-re'
              value={passwordRe} onChange={onChangePasswordRe} name='passwordRe' required />
            {passwordError && <ErrorMessage>비밀번호를 확인해주세요. </ErrorMessage>}
          </Form.Item>

          <Form.Item>
            <label htmlFor='check'>TheJoA는 회원들의 권리를 지킵니다. 약관에 내용입니다.</label>
            <Checkbox name='check' id='check' checked={check}
              onChange={onChangeCheck}
            ></Checkbox>
            {checkError && <ErrorMessage>약관에 동의하셔야 합니다. </ErrorMessage>}
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={signUpLoading}  >회원가입</Button>
          </Form.Item>
        </Form>
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  console.log(context.req.headers);
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END);
  console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});

export default Signup;
