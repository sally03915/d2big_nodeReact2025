const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');  // 로컬 인증 전략을 정의하고 있습니다.
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = () => {
    passport.use(new LocalStrategy({  // 사용자 이메일과 비밀번호를 기반으로 인증을 수행함.
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({  //데이터베이스에서 이메일을 통해 사용자를 찾기
                where: { email }
            });
            if (!user) {
                return done(null, false, { reason: '존재하지 않는 이메일입니다!' });
            }
            // 사용자가 입력한 비밀번호와  데이터베이스에 저장된 암호화된 비밀번호를 비교함.
            const result = await bcrypt.compare(password, user.password);  //비밀번호가 일치하면
            if (result) {
                return done(null, user);  // 사용자 정보를 반환하고
            }
            return done(null, false, { reason: '비밀번호가 틀렸습니다.' });  // 실패메시지를 반환함.
        } catch (error) {
            console.error(error);
            return done(error);
        }
    }));
};
