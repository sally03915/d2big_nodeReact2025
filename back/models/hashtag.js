module.exports = (sequelize, DataTypes) => {
    const Hashtag = sequelize.define('Hashtag', {  //mysql에서는 Hashtags테이블 생성  - 자동으로 s가 붙어서 생성이된다.
        // id가 기본적으로 들어가 있음.
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci', // 이모티콘 저장
    });
    Hashtag.associate = (db) => {
        db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
    };
    return Hashtag;
}