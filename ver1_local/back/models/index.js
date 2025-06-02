const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

//1. Sequelize 객체를 생성하여 데이터베이스 연결 정보를 초기화합니다. config는 환경에 따라 설정 파일(development, production)에서 가져옵니다.
const sequelize = new Sequelize(config.database, config.username, config.password, config);

//2. 모델정의
// 각각의 모델 파일(comment.js, hashtag.js, 등)을 불러와 모델을 정의합니다.
// 각 모델은 sequelize 객체와 Sequelize를 통해 정의됩니다.
db.Comment = require('./comment')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Image = require('./image')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);  // 모듈을 연결해서 sequelize  실행

//3. 모델간 관계설정
//모델 파일 내에 associate 메서드가 정의되어 있다면 이를 실행하여 모델 간의 관계(예: belongsTo, hasMany)를 설정합니다.
Object.keys(db).forEach(modelName => {  // 각각의 db안을 돌면서  - modelName 받아오기
    if (db[modelName].associate) {  // db[modelName].associate  model안의 associate가 있다면
        db[modelName].associate(db);  //associate 실행
    }
});

// 주석 처리된 부분은 모델을 초기화하는 코드일 가능성이 있습니다. 필요에 따라 사용됩니다.
// Object.keys(db).forEach(modelName => {
//   db[modelName].init(sequelize);
// });

//4. 데이터 베이스와 Sequelize 객체 내보내기
// sequelize 객체와 Sequelize를 db 객체에 추가한 뒤 이를 모듈로 내보냅니다.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;