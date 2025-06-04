import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { List, Button, Card } from 'antd';
import { UserDeleteOutlined } from '@ant-design/icons';

import { useDispatch } from 'react-redux';
import { UNFOLLOW_REQUEST, REMOVE_FOLLOWER_REQUEST } from '../reducers/user';

const FollowList = ({ header, data, onClickMore, loading }) => {
  const dispatch = useDispatch();
  const [localData, setLocalData] = useState(data);

  // 🔹 data가 변경될 때 localData도 자동으로 업데이트되도록 함
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const onCancel = (id) => () => {
    setLocalData((prevData) => prevData.filter((user) => user.id !== id)); // 🔹 즉시 삭제

    if (header === '팔로잉') {
      dispatch({
        type: UNFOLLOW_REQUEST,
        data: id,
      });
    }

    dispatch({
      type: REMOVE_FOLLOWER_REQUEST,
      data: id,
    });
  };

  const style = useMemo(() => ({
    margin: '3%',
    backgroundColor: 'white',
    padding: '3%',
  }), []);

  return (
    <List style={style}
      grid={{ gutter: 4, xs: 2, md: 3 }}
      size="small"
      header={<div>{header}</div>}
      loadMore={<div style={{ textAlign: 'center' }}><Button onClick={onClickMore} loading={loading}>더보기</Button></div>}
      dataSource={localData} // 🔹 localData 사용
      renderItem={(item) => (
        <List.Item style={{ marginTop: 20 }}>
          <Card actions={[<UserDeleteOutlined key="user" onClick={onCancel(item.id)} />]}>
            <Card.Meta description={item.nickname} />
          </Card>
        </List.Item>
      )}
    />
  );
};

FollowList.propTypes = {
  header: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  onClickMore: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default FollowList;