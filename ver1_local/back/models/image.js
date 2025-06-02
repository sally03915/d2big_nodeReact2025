module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {  //mysql에서는 Images테이블 생성  - 자동으로 s가 붙어서 생성이된다.
        // id가 기본적으로 들어가 있음.
        src: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci', //한글저장
    });
    Image.associate = (db) => {
        db.Image.belongsTo(db.Post);
    };
    return Image;
}