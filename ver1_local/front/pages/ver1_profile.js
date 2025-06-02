import React, { useState, useCallback, useEffect } from 'react';

import Head from 'next/head';
import AppLayout from '../components/AppLayout'
import NickNameForm from '../components/NickNameForm';
import FollowList from '../components/FollowList';
import { useSelector } from 'react-redux';
import Router from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';
import useSWR from 'swr';
import { backUrl } from '../config/config';


//--
const Profile = () => {
  const { user } = useSelector(state => state.user);  // 중앙저장소 - user
  const [followersLimit, setFollowersLimit] = useState(3);  //3,6,9,12,,,,
  const [followingsLimit, setFollowingsLimit] = useState(3);  //3,6,9,,,,
  const [followersData, setFollowersData] = useState([]);   //
  const [followingsData, setFollowingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //1. 유저가 있는지 확인하고   /
  useEffect(() => { if (!(user && user.id)) { Router.push('/'); } }, [user && user.id]);
  //2. 유저호출
  useEffect(() => {
    //////////  axios
    const fetchData = async () => {
      try {
        setLoading(true);

        const followersResponse = await axios.get(
          `http://localhost:3065/user/followers?limit=${followersLimit}`, { withCredentials: true }
        );
        const followingsResponse = await axios.get(
          `http://localhost:3065/user/followings?limit=${followingsLimit}`, { withCredentials: true }
        );
        setFollowersData(followersResponse.data);
        setFollowingsData(followingsResponse.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [followersLimit, followingsLimit]);

  //3. 3명씩 followingsData 추가 -  3,6,9,,,
  const loadMoreFollowings = useCallback(() => { setFollowingsLimit(prev => prev + 3); }, []);
  //4. 3명씩 followersData 추가  -  3,6,9,,,
  const loadMoreFollowers = useCallback(() => { setFollowersLimit(prev => prev + 3); }, []);

  // const data = [{ nickname: 'Title 1', }, { nickname: 'Title 2', }, { nickname: 'Title 3', }, { nickname: 'Title 4', },];

  if (!user) { return ".... 내정보 로딩중   "; }
  if (error) { console.error(error); return <div>팔로잉/팔로워 로딩중 에러발생</div>; }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title> Profile | TheJoa </title>
      </Head>
      <AppLayout>
        <NickNameForm />
        <FollowList header="팔로잉" data={followingsData} onClickMore={loadMoreFollowings}
          loading={!followersData && !error} />
        <FollowList header="팔로우" data={followersData} onClickMore={loadMoreFollowers}
          loading={!followersData && !error} />
      </AppLayout>
    </>
  );
}



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
