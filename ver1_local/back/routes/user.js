const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const { User, Post, Image, Comment } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();
const { Op } = require('sequelize');


/// 1. 회원가입 : email, nickname, password
//POST :  localhost:3065/user/
//POST :  localhost:3065/user/
/*
Header -    Content-Type  : application/json
Body   -    [Raw] - [JSON]
{
  "email": "test@test.com",
  "nickname": "test",
  "password": "test"
}

1-1. 로그인되지 않은 사용자만 접근 가능 (isNotLoggedIn).
1-2. 입력받은 이메일로 중복 확인.
1-3. 비밀번호 암호화 및 데이터베이스에 사용자 정보 저장.
1-4. 에러 발생 시 처리 및 전달.
*/
router.post('/', isNotLoggedIn, async (req, res, next) => { // POST /user/
  ///user 경로에 POST요청이 들어 왔을때 비동기 함수가   async (req, res, next) => {} 실행되도록 정의
  // isNotLoggedIn  로그인이 되지 않았다면 회원가입이 가능하도록 설정
  try {
    const exUser = await User.findOne({ // 이메일 중복확인
      where: {
        email: req.body?.email,
      }
    });
    if (exUser) { // 이미 존재한다면
      return res.status(403).send('이미 사용 중인 아이디입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12); // 미밀번호 암호화, 암호화강도 10~13
    await User.create({ // 새 사용자 생성
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });
    res.status(201).send('ok'); // 회원가입이 완료되면 상태코드
  } catch (error) {  // 에러처리
    console.error(error);
    next(error); // status 500
  }
});


///2.  로그인 , 아이디/비밀번호
// POST : localhost:3065/user/login
// POST : localhost:3065/user/login
/*
Header -    Content-Type  : application/json
Body   -    [Raw] - [JSON]
{
  "email": "test@test.com",
  "password": "test"
}

{
  "email": "test@test.com",
  "password": "1"
}
*/
router.post('/login', isNotLoggedIn, (req, res, next) => {  // 사용자가 로그인상태가 아닌지 확인
  passport.authenticate('local', (err, user, info) => {  // 로컬전략을 통해 사용자 인증을 진행함.
    if (err) {  // 인증 중 발생한 오류(err)를 처리하고
      console.error(err);
      return next(err);
    }
    if (info) {  // 인증정보가 있을경우
      return res.status(401).send(info.reason);  // 세션을 클라이언트에게 전달하여 상태코드 401반환
    }
    return req.login(user, async (loginErr) => {  // 사용자세션에 등록
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({ // 사용자정보조회
        where: { id: user.id },  // 아이디를 이용하여 정보조회
        attributes: {  // 패스워드 제외
          exclude: ['password']
        },
        include: [{ // 아이디
          model: Post,
          attributes: ['id'],
        }, {
          model: User, //사용자가  팔로우한 다른 사용자들의 id
          as: 'Followings',
          attributes: ['id'],
        }, {
          model: User,  // 사용자를 팔로우하는 다른사용자들의 id
          as: 'Followers',
          attributes: ['id'],
        }]
      })
      return res.status(200).json(fullUserWithoutPassword);  // 조회한 사용자정보를 json 형식으로 클라이언트에 반환
    });
  })(req, res, next);
});





///3.  로그인한 경우 사용자의 정보가져오기
// GET :  localhost:3065/user
// GET :  localhost:3065/user
/*
Header -   Cookie : connect.sid=Cookie값으로 설정된값
Postman 에서 로그인 후 하단에 Cookie를 보면 남아 있다.
*/
router.get('/', async (req, res, next) => { // GET /user
  ///user 경로에 GET요청이 들어 왔을때 비동기 함수가   async (req, res, next) => {} 실행되도록 정의
  try {
    // 로그인 사용자 확인
    if (req.user) {
      const fullUserWithoutPassword = await User.findOne({ // 데이터 베이스 조화
        where: { id: req.user.id },  // user객체의 아이디를 기반으로 사용자 찾기 .
        attributes: {  // 비밀번호를 결과에서 제외하여 보안성 높이기
          exclude: ['password']
        },  // posts에서 사용자가 작성한 게시물의 id만 가져오기
        include: [{
          model: Post,
          attributes: ['id'],
        }, { // Followings 에서 사용자가 팔로우하는 사람들의 id만 가져오기
          model: User,
          as: 'Followings',
          attributes: ['id'],
        }, { // Followers 사용자를 팔로우하는 사람들의 id만 가져오기
          model: User,
          as: 'Followers',
          attributes: ['id'],
        }]
      })
      // 로그인된 사용자의 데이터를 성공적으로 조회했다면 json 형식으로 데이터를 클라이언트에 반환함.
      res.status(200).json(fullUserWithoutPassword);
    } else {
      res.status(200).json(null);  // 로그인이 안되면 null 반환.
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});





/// 4. 로그아웃
//POST :  localhost:3065/user/logout
//POST :  localhost:3065/user/logout
/*
Header -   Cookie : connect.sid=Cookie값으로 설정된값
Postman 에서 로그인 후 하단에 Cookie를 보면 남아 있다.
*/
//POST :  localhost:3065/user/logout
router.post('/logout', isLoggedIn, (req, res, next) => {  // 사용자가 로그인상태면  로그아웃이 실행되도록

  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.send('ok'); // 로그아웃 성공 응답
    });
  });

});

/// 5. 닉네임변경
//PATCH :  localhost:3065/user/nickname
//PATCH :  localhost:3065/user/nickname
/*
1. 로그인하기
2. Header 쿠키설정
3. Body - [Raw] - [Json]
{
  "nickname": "zero"
}
*/
router.patch('/nickname', isLoggedIn, async (req, res, next) => {  // 사용자가 로그인을 했다면
  try {
    await User.update({ // user테이블의 특정 사용자의 nickname값을 업데이트하는 역할
      nickname: req.body.nickname,
    }, {
      where: { id: req.user.id },  //사용자의 아이디가 같은 유저의
    });
    res.status(200).json({ nickname: req.body.nickname });  // 변경한 닉네임을 전달함.
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/// 6. 팔로우
//PATCH :   localhost:3065/user/아이디/follow
//PATCH :   localhost:3065/user/아이디/follow
/*
Header -   Cookie : connect.sid=Cookie값으로 설정된값
Postman 에서 로그인 후 하단에 Cookie를 보면 남아 있다.
*/
// 1. 로그인한 사람만 접근
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => { // PATCH /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId } }); //데이터베이스에서 해당 id사용자 찾기기
    if (!user) {
      res.status(403).send('없는 사람을 팔로우하려고 하시네요?');
    }
    await user.addFollowers(req.user.id);  //팔로워목록에 추가
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });  // 팔로우가 성공하면 userid를 json형식으로 응답
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/// 7. 팔로잉 찾기(내가 찾아보는 친구들 )
// 내가 지켜보는 친구들~!
//GET :  localhost:3065/followings
//GET :  localhost:3065/followings
/*
1. 로그인하기
2. Header 쿠키설정
*/
router.get('/followings', isLoggedIn, async (req, res, next) => { // GET /user/followings
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send('없는 사람을 찾으려고 하시네요?');
    }
    const followings = await user.getFollowings();
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});



/// 8. 팔로우찾기 (날 지켜보는 친구들 찾아보기 )
//GET :  localhost:3065/user/followers
//GET :  localhost:3065/user/followers
//  사용자가 인증된 상태인지 확인 , 로그인된 사람만 팔로우 확인
/*
1. 로그인하기
2. Header 쿠키설정
*/
router.get('/followers', isLoggedIn, async (req, res, next) => { // GET /user/followers
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 유효한id인지
    if (!user) {
      res.status(404).send('없는 사람을 찾으려고 하시네요?');
    }
    const followers = await user.getFollowers();  // 팔로우 리스트 가져오기
    res.status(200).json(followers);  // 팔로워 리스트가 성공적으로 조회되면, 클라이언트에 JSON 형식으로 팔로워 데이터를 반환
  } catch (error) {
    console.error(error);
    next(error);
  }
});




/// 9. 언팔로우 - 나랑 그만보자!
//DELETE: localhost:3065/user/12/follow
//DELETE: localhost:3065/user/12/follow
// 로그인이 되어 있는지 확인 - 로그인 후 진행
/*
DELETE   http://localhost:3065/test/follow/13

test@test.com
test

1. 로그인하기
2. Header 쿠키설정
*/
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => { // DELETE /user/1/follow
  try {
    // 유저 찾기
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('없는 사람을 언팔로우하려고 하시네요?');
    }
    // 팔로우 삭제
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/// 10. 나를 팔로워한사람 차단
//DELETE :  localhost:3065/users/follower/12
//DELETE :  localhost:3065/users/follower/12
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => { // DELETE /user/follower/2
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('없는 사람을 차단하려고 하시네요?');
    }
    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
router.get('/:userId/posts', async (req, res, next) => { // GET /user/1/posts
  try {
    const where = { UserId: req.params.userId };
    if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }
    } // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
    const posts = await Post.findAll({
      where,
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
          order: [['createdAt', 'DESC']],
        }],
      }, {
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      }],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});



/////////////////////////////////////////////////
router.get('/:userId', async (req, res, next) => { // GET /user/1
  try {
    const fullUserWithoutPassword = await User.findOne({
      where: { id: req.params.userId },
      attributes: {
        exclude: ['password']
      },
      include: [{
        model: Post,
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followers',
        attributes: ['id'],
      }]
    })
    if (fullUserWithoutPassword) {
      const data = fullUserWithoutPassword.toJSON();
      data.Posts = data.Posts.length;  
      data.Followers = data.Followers.length;
      data.Followings = data.Followings.length;
      res.status(200).json(data);
      console.log('........... user/번호', data);
    } else {
      res.status(404).json('존재하지 않는 사용자입니다.');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;