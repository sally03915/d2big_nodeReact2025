import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Input } from 'antd'
import userInput from '../hooks/userInput'

import { ADD_COMMENT_REQUEST } from '../reducers/post';
import { useDispatch, useSelector } from 'react-redux';

//---
const CommentForm = ({ post }) => {   // 어떤게시글에대한 댓글
  const dispatch = useDispatch();
  const { addCommentLoading, addCommentDone } = useSelector(state => state.post);
  const id = useSelector(state => state.user.user?.id);

  ///////////////////////////////////// code
  const [comment, onChangeComment, setComment] = userInput('');

  useEffect(() => {
    if (addCommentDone) { setComment(''); }
  }, [addCommentDone]);

  const onSubmitForm = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }
    console.log(post.id, comment);
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: { content: comment, userId: id, postId: post.id }
    })
  }, [comment, id]);
  ///////////////////////////////////// view
  return (
    <Form onFinish={onSubmitForm} style={{ margin: 50, position: 'relative' }}  >
      <Input.TextArea rows={5} value={comment} onChange={onChangeComment} />
      <Button htmlType="submit" style={{ position: 'absolute', right: 0, bottom: -50 }} type="primary" loading={addCommentLoading}  >댓글</Button>
    </Form>
  );
};
CommentForm.propTypes = { post: PropTypes.object.isRequired };
export default CommentForm;