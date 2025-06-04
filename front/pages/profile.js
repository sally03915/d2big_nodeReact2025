import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import AppLayout from '../components/AppLayout';
import NickNameForm from '../components/NickNameForm';
import FollowList from '../components/FollowList';
import { useSelector } from 'react-redux';

import Router from 'next/router';
import axios from 'axios';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import { END } from 'redux-saga';
import wrapper from '../store/configureStore';
import useSWR from 'swr';
import { backUrl } from '../config/config';

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((result) => result.data);

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);

  const { data: followersData, error: followerError } = useSWR(`${backUrl}/user/followers?limit=${followersLimit}`, fetcher);
  const { data: followingsData, error: followingError } = useSWR(`${backUrl}/user/followings?limit=${followingsLimit}`, fetcher);

  useEffect(() => { if (!(user && user.id)) { Router.push('/'); } }, [user && user.id]);
  const loadMoreFollowings = useCallback(() => { setFollowingsLimit((prev) => prev + 3); }, []);
  const loadMoreFollowers = useCallback(() => { setFollowersLimit((prev) => prev + 3); }, []);

  if (!user) { return '내 정보 로딩중...'; }

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return <div>팔로잉/팔로워 로딩 중 에러가 발생합니다.</div>;
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title> Profile | TheJoa </title>
      </Head>
      <AppLayout>
        <NickNameForm />
        <FollowList header="팔로잉" data={followingsData} onClickMore={loadMoreFollowings} loading={!followingsData && !followingError} />
        <FollowList header="팔로워" data={followersData} onClickMore={loadMoreFollowers} loading={!followersData && !followerError} />
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

export default Profile;
