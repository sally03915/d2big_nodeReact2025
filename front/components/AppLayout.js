import React, { useState, useMemo, useCallback } from 'react';   // react 불러오기   #
import PropTypes from 'prop-types'; // props 타입검사하는 역할
import Link from 'next/link';
import Router from 'next/router';
import { Menu, Input, Row, Col } from 'antd';

import UserProfile from './UserProfile';
import LoginForm from './LoginForm';
import Chat from './Chat';
import styled from 'styled-components';

import { useSelector } from 'react-redux';  //## reducer1
import userInput from '../hooks/userInput';

const InputSearch = styled(Input.Search)`
  vertical-align:middle;
`;

//--
const AppLayout = ({ children }) => {

  // useMemo
  const stylebg = useMemo(() => ({ backgroundColor: '#efefef' }), []);
  const { user } = useSelector(state => state.user);
  const [searchInput, onChangeSearchInput] = userInput('');

  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
  }, [searchInput]);

  ///////////////////////////////////////////// code
  const items = [
    { label: <Link href="/">LOGO</Link>, key: '/' }
    , { label: <Link href="/profile">프로필</Link>, key: '/profile' }
    , { label: <Link href="/signup">회원가입</Link>, key: '/signup' }
    , {
      label: <InputSearch
        placeholder="input search text"
        enterButton
        value={searchInput}
        onChange={onChangeSearchInput}
        onSearch={onSearch}
      />, key: '/search'
    }
  ];
  ///////////////////////////////////////////// view
  return (
    <div>
      <Menu mode="horizontal" items={items} />
      <Row gutter={8}>
        <Col xs={24} md={6} >
          {user ? <UserProfile /> : <LoginForm />}
        </Col>
        <Col xs={24} md={12} style={stylebg} > {children}  </Col>
        <Col xs={24} md={6} >
           <div  style={{margin:'20px 0'}}>
           <Chat />
          <div>  
          <a href="https://d2big.com"
            target="_blank"
              rel="noreferrer  noopener">TheJoa</a> copyrights. all reserved.
            </div>
            </div>
          </Col>
      </Row>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
export default AppLayout;