import React, { useCallback, useState, useRef, useEffect } from 'react';  //##
import { Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_POST_REQUEST, UPLOAD_IMAGES_REQUEST, REMOVE_IMAGE } from '../reducers/post';
import userInput from '../hooks/userInput';  //##
import { backUrl } from '../config/config';

//--
const PostForm = () => {
  const dispatch = useDispatch();
  const { imagePaths, addPostLoading, addPostDone } = useSelector((state) => state.post);
  const [text, onChangeText, setText] = userInput('');

  useEffect(() => { if (addPostDone) { setText(''); } }, [addPostDone]);

  const onSubmitForm = useCallback(() => {
    if (!text || !text.trim()) {
      return alert('게시글을 작성하세요.');
    }

    const formData = new FormData();
    imagePaths.forEach((p) => {
      formData.append('image', p);
    });
    formData.append('content', text);
    return dispatch({
      type: ADD_POST_REQUEST,
      data: formData,  // data: text
    });
  }, [text, imagePaths]); //}, [text]);

  const imageInput = useRef();
  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, [imageInput.current]);

  const onChangeImages = useCallback((e) => {
    console.log('images', e.target.files); // 파일넘겨받음.
    const imageFormData = new FormData();

    [].forEach.call(e.target.files, (f) => {
      imageFormData.append('image', f);
    });

    dispatch({
      type: UPLOAD_IMAGES_REQUEST,
      data: imageFormData,
    });
  }, []);

  const onRemoveImage = useCallback((index) => () => {
    dispatch({
      type: REMOVE_IMAGE,
      data: index,
    });
  }, []);


  return (<Form layout="vertical" style={{ margin: '3%' }}
    encType="multipart/form-data" onFinish={onSubmitForm} >
    <Form.Item label="TheJoa Write" >
      <Input.TextArea placeholder='게시글을 적어주세요'
        maxLength={200} value={text} onChange={onChangeText} />
    </Form.Item>
    <Form.Item>
      <input type="file" name="image" multiple hidden ref={imageInput} style={{ display: 'none' }} onChange={onChangeImages} />
      <Button onClick={onClickImageUpload} >이미지업로드</Button>
      <Button type="primary" style={{ float: 'right' }}
        htmlType='submit' loading={addPostLoading}>POST</Button>
    </Form.Item>
    <div>
      {Array.isArray(imagePaths) ? imagePaths.map((v, i) => (
        <div key={v} style={{ display: 'inline-block' }}>
          <img src={`${backUrl}/${v}`} style={{ width: '200px' }} alt={v} />
          <div>
            <Button onClick={onRemoveImage(i)}>제거</Button>
          </div>
        </div>
      )) : null}
    </div>
  </Form>);
};

export default PostForm;