const express = require('express');
const { Op } = require('sequelize');

const { Post, Image, User, Comment } = require('../models');

const router = express.Router();
/////// 게시글의 목록을 가져오는 api
/// 글 10개씩 가져오기
// 1. 모든 사용자가 접근가능
router.get('/', async (req, res, next) => { // GET /posts
    try {
        //2. 게시글 조회 조건 설정
        // 초기 로딩(첫 요청)일 경우 모든 데이터를 조회합니다.
        // 이후 요청에서는 lastId 쿼리 매개변수를 이용해 이전 게시글 ID보다 작은 ID를 가진 데이터만 조회합니다.
        const where = {};
        //  lastId 를 이용하여 이전데이터만 조회 - 무한스크롤 구현
        if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
            where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }
        } // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
        //           작은 <  마지막아이디보다    10개

        //3. 게시글 가져오기
        // 최대 10개의 게시글 가져오기
        // 최신순으로 정렬
        const posts = await Post.findAll({
            where,
            limit: 10,
            order: [
                ['createdAt', 'DESC'],
                [Comment, 'createdAt', 'DESC'],
            ],
            include: [{   //4. 연관된 데이터 포함.
                model: User,   // 게시글작성자는
                attributes: ['id', 'nickname'],  //id와 nickname만 가져오기
            }, {
                model: Image,  // 게시글과 연결된 이미지 정보만 포함.
            }, {
                model: Comment,  // 댓글
                include: [{
                    model: User,  //댓글작성자자
                    attributes: ['id', 'nickname'],  //id, nickname 추가
                }],
            }, {
                model: User, // 좋아요 누른 사람
                as: 'Likers',   // Likers 별칭사용
                attributes: ['id'],
            }, {
                model: Post,  // 리트윗 정보
                as: 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],  // 원게시글의 작성자 정보와 이미지 포함.
                }, {
                    model: Image,
                }]
            }],
        });
        console.log(posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
