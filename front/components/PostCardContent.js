import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types'; // 넘겨받은 데이터확인
import { Button, Input } from 'antd';// 화면디자인
import { useSelector } from 'react-redux';// 중앙저장소  
import Link from 'next/link';
 
                          //게시글,  편집모드-false/true, 수정,  삭제
const PostCardContent = ({ postData, editMode, onChangePost, onCancelUpdate }) => {
  const { updatePostLoading, updatePostDone } = useSelector(state => state.post);  //// 중앙저장소 상태
  const [editText, setEditText] = useState(postData);  // 글받아서 수정 -  변수:글수정 , react알려:글수정반영

  useEffect(() => {
    if (updatePostDone) { onCancelUpdate(); }
  }, [updatePostDone]);

  const onChangeText = useCallback((e) => {
    setEditText(e.target.value);
  });  // 글수정event반영

  const onClickCancel = useCallback(() => {
    setEditText(postData);
    onCancelUpdate();
  });  // 수정취소

  return ( 
    <div>
      {editMode
        ? (
          <>
            <Input.TextArea value={editText} onChange={onChangeText} />
            <Button.Group  style={{margin:'10px 0'}}>
              <Button loading={updatePostLoading} onClick={onChangePost(editText)}  style={{margin:'5px'}}>수정</Button>
              <Button type="danger" onClick={onClickCancel}  style={{margin:'5px'}}>취소</Button>
            </Button.Group>
          </>
        )
        : postData.split(/(#[^\s#]+)/g)   //해쉬태그분리
                  .map((v, i) => {
                          if (v.match(/(#[^\s#]+)/)) {
                            return <Link href={`/hashtag/${v.slice(1)}`} prefetch={false} key={i}>{v}</Link>;
                          }
                          return v;
                  })
      }
    </div>
  );
};

PostCardContent.propTypes = {
  postData: PropTypes.string.isRequired,
  editMode: PropTypes.bool,
  onChangePost: PropTypes.func.isRequired,
  onCancelUpdate: PropTypes.func.isRequired,
};

PostCardContent.defaultProps = {
  editMode: false,
};

export default PostCardContent;
