module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {  //mysql에서는 Comments테이블 생성  - 자동으로 s가 붙어서 생성이된다.
        // id가 기본적으로 들어가 있음.
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci', // 이모티콘 저장
    });
    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User);
        db.Comment.belongsTo(db.Post);
    };
    return Comment;
}