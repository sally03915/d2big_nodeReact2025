import React, { useState, useCallback, useEffect } from 'react'
import { Input, Button, Form, Row, Col } from 'antd';
import Link from 'next/link';
import userInput from '../hooks/userInput';

import { useDispatch, useSelector } from 'react-redux';  //#2. redux - useDispatch
import { LOG_IN_REQUEST } from '../reducers/user';  //######1. redux

//--
//const LoginForm = ({setIsLogin}) => {
const LoginForm = () => {
  const dispatch = useDispatch();
  const { logInLoding, logInError } = useSelector(state => state.user);
  ///////////////////////////////////////////// code
  const [email, onChangeEmail] = userInput('');
  const [password, onChangePassword] = userInput('');


  useEffect(() => {
    if (logInError) {
      alert(logInError);
    }
  }, [logInError]);

  const onSubmitForm = useCallback(() => {
    console.log(email, password);
    //setIsLoggedIn(true);
    dispatch({
      type: LOG_IN_REQUEST,
      data: { email, password }
    });
  }, [email, password]);

  ///////////////////////////////////////////// view
  return (
    <>
      <Form layout="vertical" style={{ padding: '3%' }} onFinish={onSubmitForm}  >
        <Form.Item label="아이디" name="email"  >
          <Input placeholder="user@gmail.com 형식으로 입력"
            value={email} onChange={onChangeEmail} required />
        </Form.Item>
        <Form.Item label="비밀번호" name="password" >
          <Input.Password placeholder="비밀번호 입력"
            value={password} onChange={onChangePassword} required />
        </Form.Item>
        <Form.Item style={{ textAlign: 'center' }}>
          {/*<Button type="primary" style={{ marginRight: '2%' }} onClick={onCount} >로그인 {count}</Button> */}

          <Button type="primary"
            style={{ marginRight: '2%' }}
            htmlType='submit'
            loading={logInLoding}
          >로그인</Button>

          <Link href="/signup" legacyBehavior><Button>회원가입</Button></Link>
        </Form.Item>
      </Form>
    </>
  );
};
export default LoginForm;