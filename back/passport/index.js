const passport = require('passport');  // Passport는 Node.js에서 사용자 인증을 간편하게 처리하기 위한 미들웨어
const local = require('./local');  // 사용자 id와 비밀번호를 사용하여 인증을 처리함.
const { User } = require('../models'); // serialize orm을 사용하여 데이터베이스와 연결된 모델. 사용자 데이터가 데이터베이스에 저장되고 관리됨.

module.exports = () => {
    //1. 로그인한 사용자의 정보를 세션에 저장하는 과정을 처리함.
    // 전체사용자의 객체를 저장하는 대신 id만 저장하여 효율성을 높임.
    passport.serializeUser((user, done) => { // 서버쪽에 [{ id: 1, cookie: 'clhxy' }]
        done(null, user.id); //세션에는 사용자 id만 저장됨.
    });

    //2. 세션에 저장된 사용자 id를 기반으로 데이터베이스에서 사용자를 조회함.
    // 조회한 사용자 정보를 요청객체의   req.user에 연결함.
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findOne({ where: { id } });  // id로 사용자 조회
            done(null, user); // req.user  조회된 정보를 req.user에 저장
        } catch (error) {
            console.error(error);  //에러로그 출력
            done(error); // 에러 처리
        }
    });

    local();
};

// 프론트에서 서버로는 cookie만 보내요(clhxy)
// 서버가 쿠키파서, 익스프레스 세션으로 쿠키 검사 후 id: 1 발견
// id: 1이 deserializeUser에 들어감
// req.user로 사용자 정보가 들어감

// 요청 보낼때마다 deserializeUser가 실행됨(db 요청 1번씩 실행)
// 실무에서는 deserializeUser 결과물 캐싱
