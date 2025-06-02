import React, { useCallback } from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from '../reducers/user';

function FollowButton({ post }) {
    const dispatch = useDispatch();
    const { user, followLoading, unfollowLoading } = useSelector((state) => state.user);
    const isFollowing = user?.Followings.find((v) => v.id === post.User.id);  // 팔로잉여부
    // 팔로잉하는 사람들 목록 중에 게시글 작성 중의  아이디를 갖고 있다면
    const onClickButton = useCallback(() => {
        if (isFollowing) {
            dispatch({
                type: UNFOLLOW_REQUEST,
                data: post.User.id,  // 사용자아이디 넣어줌
            });
        } else {
            dispatch({
                type: FOLLOW_REQUEST,
                data: post.User.id,   // 사용자아이디 넣어줌
            });
        }
    }, [isFollowing]);

    if (post.User.id === user.id) {
        return null;
    }
    return (
        <Button loading={followLoading || unfollowLoading} onClick={onClickButton}>
            {isFollowing ? '언팔로우' : '팔로우'}
        </Button>
    );
}

FollowButton.propTypes = {
    post: PropTypes.object.isRequired,
};

export default FollowButton;