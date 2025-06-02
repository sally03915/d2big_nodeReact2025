module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {  //mysql에서는 users테이블 생성  - 자동으로 s가 붙어서 생성이된다.
        // id가 기본적으로 들어가 있음.
        email: {
            type: DataTypes.STRING(30), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
            allowNull: false, // 필수
            unique: true, // 고유한 값
        },
        nickname: {
            type: DataTypes.STRING(30),
            allowNull: false, // 필수
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false, // 필수
        },
    }, {

        charset: 'utf8',
        collate: 'utf8_general_ci', // 한글 저장
    });
    User.associate = (db) => {
        db.User.hasMany(db.Post);  //유저는 많은 게시글을 가질 수 있다.  작성자
        db.User.hasMany(db.Comment);
        db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' })
        db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'FollowingId' });   // User 테이블과 User테이블사이에
        db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'FollowerId' });
        // through    중간테이블이름바꾸기
        // foreignKey 컬럼의 어떤아이디를 참고했는지 - sally를 누가 팔로잉을 했는지 찾을려면  sally팔로워  FollowerId를 먼저 찾고 , Followings
    };
    return User;
}