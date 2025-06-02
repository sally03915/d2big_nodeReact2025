import { Form, Input } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import userInput from '../hooks/userInput';
import { CHANGE_NICKNAME_REQUEST } from '../reducers/user';

const NickNameForm = () => {
   const { user, changeNicknameLoading } = useSelector((state) => state.user);
   const [nickname, onChangeNickname] = userInput(user?.nickname || '');
   const dispatch = useDispatch();

   const onSubmit = useCallback(() => {
      dispatch({
         type: CHANGE_NICKNAME_REQUEST,
         data: nickname,
      });
   }, [nickname]);

   return (
      <Form style={{ margin: '3%', padding: '20px' }}>
         <Input.Search value={nickname}
            onChange={onChangeNickname}
            addonBefore="닉네임"
            enterButton="수정"
            onSearch={onSubmit}
            loading={changeNicknameLoading}
         />
      </Form>
   );
};

export default NickNameForm;