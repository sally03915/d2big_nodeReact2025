import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AppLayout from '../components/AppLayout'
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';  //##

import wrapper from '../store/configureStore';
import { END } from 'redux-saga';
import axios from 'axios';

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post); //##

  useEffect(() => {  //##
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  /*
    //## 계속호출
    useEffect(() => {
      if (hasMorePosts && !loadPostsLoading) {
        const lastId = mainPosts[mainPosts.length - 1]?.id;  //맨마지막으로쓴 게시글
        dispatch({
          type: LOAD_POSTS_REQUEST,
          lastId,
        })
      }
    }, [mainPosts, hasMorePosts, loadPostsLoading]);
  */
  //## 스크롤내려서 맨끝에서 다시 로딩
  useEffect(() => {
    function onScroll() {
      //           내가 내린길이     + 화면에 보이는 높이                        = 브라우저길이
      console.log(window.screenY, document.documentElement.clientHeight, document.documentElement.scrollHeight)
      //        내가 내린길이     + 화면에 보이는 높이    >  브라우저길이-200px 아래정도로 오면은
      if (window.screenY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 200) {
        if (hasMorePosts && !loadPostsLoading) {
          dispatch({
            type: LOAD_POSTS_REQUEST,
            data: mainPosts[mainPosts.length - 1]?.id,
          })
        }
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);  //스크롤했으면 스크롤했던거 remove, 메모리에 쌓임
    }
  }, [mainPosts, hasMorePosts, loadPostsLoading]);


  return (<AppLayout>
    {user && <PostForm />}

    {mainPosts.map((c) => {
      return (
        <PostCard post={c} key={c.id} />
      );
    })}

  </AppLayout>);
}

///////////////////////////////////////////////////////////

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch({
    type: LOAD_POSTS_REQUEST,
  });
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});


export default Home;