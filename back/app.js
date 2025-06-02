////1. require
const express = require('express');  // express 프레임워크를 사용해 서버 생성
const cors = require('cors');  // CORS(Cross-Origin Resource Sharing)를 설정하여 다른 도메인에서의 API 요청을 허용
const session = require('express-session');
const cookieParser = require('cookie-parser'); //쿠키와 세션을 관리하여 사용자의 인증 및 상태를 유지
const passport = require('passport');  //쿠키와 세션을 관리하여 사용자의 인증 및 상태를 유지
const dotenv = require('dotenv');  // 환경변수 .env 를 로드하여 민감한 데이터를 보호함.
const morgan = require('morgan');  // 브라우저 로그인 처리
const path = require('path');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const hashtagRouter = require('./routes/hashtag');  // 라우터 연결
const db = require('./models');
const passportConfig = require('./passport');

//const schedule = require('./util/schedule').default;  //## util - schedule.js
const server = require('./util/server');

//#####
// const hpp = require('hpp');
// const helmet = require('helmet');

////2. 환경설정
dotenv.config();  //환경설정 .env 를 로드
const app = express();

////3. 데이터베이스 연결
db.sequelize.sync()
    .then(() => {
        console.log('db 연결 성공');
    })
    .catch(console.error);
passportConfig();  //

/////4. 각종사용 연결
/*
if (process.env.NODE_ENV === 'production') { //// 배포용
    app.use(morgan('combined'));
    app.use(hpp());
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors({
        origin: 'http://d2bing.com',
        credentials: true,
    }));
} else {  //// 개발용
*/
app.use(morgan('dev'));  // http요청로그를 기록하여 디버깅과 모니터링
app.use(cors({
    origin: 'http://localhost:3000',  // 요청허용
    credentials: true,  // 쿠키와 같은 인증정보르 포함한 요청도 허용
}));

/*} */


app.use('/', express.static(path.join(__dirname, 'uploads')));   // uploads 디렉토리의 파일을  액세스할수 있게
app.use(express.json());  // 요청본문을 파싱하는 미들웨어 - 클라이언트로부터 json 데이터를 받을 때 사용됨.
app.use(express.urlencoded({ extended: true }));  // url 요청본문을 파싱함.
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키를 파싱하는 미들웨어
// 세션관리를 위한 미들웨어

if (process.env.NODE_ENV === 'production') { //// 배포용
    app.use(session({
        saveUninitialized: false,  // 초기화되지 않은 세션은 저장하지 않음.
        resave: false,  // 세션이 변경되지 않았다면 저장하지 않음.
        secret: process.env.COOKIE_SECRET,  // 세션데이털르 암호화하기위한 비밀키
        cookie: {
            httpOnly: true,
            secure: false,
            domain: process.env.NODE_ENV === 'production' && '.d2big.com',
            maxAge: 24 * 60 * 60 * 1000 // 24시간 (밀리초 단위)
        },
    }));
} else {
    app.use(session({
        saveUninitialized: false,  // 초기화되지 않은 세션은 저장하지 않음.
        resave: false,  // 세션이 변경되지 않았다면 저장하지 않음.
        secret: process.env.COOKIE_SECRET,  // 세션데이털르 암호화하기위한 비밀키
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000 // 24시간 (밀리초 단위)
         } // production에서는 true로 설정
    }));
}
app.use(passport.initialize());  // passport 를 초기화하는 미들웨어 , passport는 인증을 처리하는 라이브러리
app.use(passport.session()); // 사용자의 인증상태를 세션에 저장하고 요청간에 유지

app.get('/', (req, res) => {
    res.send('hello express');
});
// API는 다른 서비스가 내 서비스의 기능을 실행할 수 있게 열어둔 창구
////5. 라우팅 - 요청을 처리하는 라우터를 연결
app.use('/posts', postsRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter); //##

////6. 서버설정 및 실행
app.listen(3065, () => {
    console.log('서버 실행 중!');
});
