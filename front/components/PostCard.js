import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';

import { Card, Button, Avatar, Popover, List, Comment } from 'antd';
import { RetweetOutlined, HeartTwoTone, HeartOutlined, MessageOutlined, EllipsisOutlined, ShareAltOutlined } from '@ant-design/icons';


import PostImages from './PostImages';
import CommentForm from './CommentForm';
import PostCardContent from './PostCardContent';
import FollowButton from './FollowButton';

import { LIKE_POST_REQUEST, REMOVE_POST_REQUEST, UNLIKE_POST_REQUEST, RETWEET_REQUEST, UPDATE_POST_REQUEST } from '../reducers/post';

import moment from 'moment';
moment.locale('ko');

//---
const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { removePostLoading } = useSelector((state) => state.post);
  //const id = useSelector((state) => state.user.me && state.user.me.id);
  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const { user } = useSelector((state) => state.user);
  const id = user && user.id;
  const [editMode, setEditMode] = useState(false);
  /*const [liked, setLiked] = useState(false);

  const onToggleLike = useCallback(() => {
    setLiked((prev) => !prev);
  }, []); */

  const onClickUpdate = useCallback(() => {
    setEditMode(true);
  }, []);

  const onCancelUpdate = useCallback(() => {
    setEditMode(false);
  }, []);
  const onChangePost = useCallback((editText) => () => {
    dispatch({
      type: UPDATE_POST_REQUEST,
      data: {
        PostId: post.id,
        content: editText,
      },
    });
  }, [post]);


  const onClickLike = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: LIKE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);
  const onClickUnlike = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: UNLIKE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);


  const onToggleComment = useCallback(() => {
    setCommentFormOpened((prev) => !prev);
  }, []);

  const onRemovePost = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: REMOVE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);


  const onRetweet = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: RETWEET_REQUEST,
      data: post.id,
    });
  }, [id]);


  const liked = post.Likers?.find((v) => v.id === id);

  ////////////////////////////////////////////////////
  // share kakao talk
  const loadKakaoSDK = () => {
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao) {
        window.Kakao.init("668d3271e4f5e9d45ec7f4a12b001802"); // 앱 키 설정
      }
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    loadKakaoSDK();
  }, []);

  const shareToKakao = (postId) => {
    window.Kakao.Link.sendDefault({
      objectType: "text",
      text: "이 링크를 확인해보세요!",
      link: {
        mobileWebUrl: `http://localhost:3000/post/${postId}`,
        webUrl: `http://localhost:3000/post/${postId}`,
      },
    });
  };


  // 클릭하면 주소링크복사되는 코드
  const onClickShare = () => {
    const urlToCopy = window.location.href; // 현재 페이지 URL 또는 특정 URL을 사용할 수 있음
    navigator.clipboard.writeText(urlToCopy)
      .then(() => {
        alert("링크가 복사되었습니다!");
      })
      .catch(err => {
        console.error("복사에 실패했습니다.", err);
      });
  };
  //////////////////////////////////////////////////////

  return (
    <div style={{ marginBottom: 20 }}>
      <Card cover={post.Images?.[0] && <PostImages images={post.Images} />}
        actions={[
          <RetweetOutlined key="retweet" onClick={onRetweet} />,
          liked
            ? <HeartTwoTone twoToneColor="#eb2f96" key="heart" onClick={onClickUnlike} />
            : <HeartOutlined key="heart" onClick={onClickLike} />,

          <MessageOutlined key="comment" onClick={onToggleComment} />,
          <Popover key="more" content={(
            <Button.Group>
              {id && post.User.id === id
                ? (
                  <>
                    {!post.RetweetId && <Button onClick={onClickUpdate}>수정</Button>}
                    <Button type="danger" loading={removePostLoading} onClick={onRemovePost}>삭제</Button>
                  </>
                )
                : <Button>신고</Button>}
            </Button.Group>
          )}>
            <EllipsisOutlined />
          </Popover>,
          <ShareAltOutlined key="share" onClick={() => shareToKakao(post.id)} />
        ]}
        title={post.RetweetId ? `${post.User.nickname}님이 리트윗하셨습니다.` : null}
        extra={id && <FollowButton post={post} />}
      >
        {post.RetweetId && post.Retweet
          ? (
            <Card
              cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images} />}
            >
              <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
              <Card.Meta
                avatar={(
                  <Link href={`/user/${post.Retweet.User.id}`} prefetch={false} legacyBehavior>
                    <a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a>
                  </Link>
                )}

                title={post.Retweet.User.nickname}
                description={<PostCardContent postData={post.Retweet.content}
                  onChangePost={onChangePost} onCancelUpdate={onCancelUpdate} />}
              />
            </Card>
          )
          : (
            <>
              <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
              <Card.Meta
                avatar={(
                  <Link href={`/user/${post.User.id}`} prefetch={false} legacyBehavior>
                    <a><Avatar>{post.User.nickname[0]}</Avatar></a>
                  </Link>
                )}
                title={post.User.nickname}
                description={<PostCardContent editMode={editMode} onChangePost={onChangePost}
                  onCancelUpdate={onCancelUpdate} postData={post.content} />}
              />
            </>
          )}
      </Card>
      {commentFormOpened && (
        <>
          <CommentForm post={post} />
          <List
            header={`${post.Comments.length} 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comments}
            renderItem={(item) => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={(
                    <Link href={{ pathname: '/user', query: { id: item.User.id } }}
                      as={`/user/${item.User.id}`} legacyBehavior>
                      <a><Avatar>{item.User.nickname[0]}</Avatar></a>
                    </Link>
                  )}
                  content={item.content}
                />
              </li>
            )}
          />
        </>
      )}
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object),
    Likers: PropTypes.arrayOf(PropTypes.object),
    RetweetId: PropTypes.number,
    Retweet: PropTypes.objectOf(PropTypes.any),
  }).isRequired,
};
export default PostCard;
