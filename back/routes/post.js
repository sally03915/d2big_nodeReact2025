const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { Post, Image, Comment, User, Hashtag } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()



///1. 업로드 설정
/////////////////////////////////////////////////////////////
// const multerS3 = require('multer-s3');
// const AWS = require('aws-sdk');
/////////////////////////////////////////////////////////////
try {
    fs.accessSync('uploads') // 폴더 존재여부 확인
} catch (error) {
    console.log('uploads 폴더가 없으므로 생성합니다.')
    fs.mkdirSync('uploads') // 폴더만들기
}

const upload = multer({
    // upload  미들웨어 생성
    storage: multer.diskStorage({
        //storage- Multer의 저장소 설정으로, 업로드된 파일의 저장 위치와 파일 이름을 지정하는 역할
        //multer.diskStorage -  파일을 디스크(로컬 파일 시스템)에 저장하도록 설정
        destination(req, file, done) {
            // 업로드된 파일이 저장될 경로를 지정
            done(null, 'uploads')  // 콜백
        },
        filename(req, file, done) { // 업로드된 파일의 이름을 지정
            // upload1.png
            const ext = path.extname(file.originalname) // 확장자 추출(.png)
            const basename = path.basename(file.originalname, ext) // upload1
            done(null, basename + '_' + new Date().getTime() + ext) // upload1_15184712891.png
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
})

/*
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});
const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'react-nodebird',
    key(req, file, cb) {
      cb(null, `original/${Date.now()}_${path.basename(file.originalname)}`)
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

*/
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

///2. 게시글(Post)을 생성하고 관련 데이터를 저장하는 역할
// localhost:3065/posts?lastId=24
/*
1. 로그인
2. Header :   Content-Type: application/json
3. Header :   Cookie  설정
4. Body :
{
  "content": "새로운 게시글입니다! #노드 #리액트",
  "image": ["image1.png", "image2.png"]
}
*/
// 2-1. 라우터정의의
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
    // POST /post
    try {
        // 2-2. 해시티그 분석 -  정규표현식 /#[^\s#]+/g를 사용해 #으로 시작하는 단어 찾기
        const hashtags = req.body.content.match(/#[^\s#]+/g)
        // 2-3. 게시글 저장
        const post = await Post.create({
            content: req.body.content,
            UserId: req.user.id,
        })

        //  추출된 해시태그가 존재하면
        // findOrCreate를 통해 데이터베이스에서 해당 해시태그를 생성하거나 기존에 있는지 확인
        if (hashtags) {
            const result = await Promise.all(
                hashtags.map((tag) =>
                    Hashtag.findOrCreate({
                        where: { name: tag.slice(1).toLowerCase() },
                    })
                )
            ) // [[노드, true], [리액트, true]]
            await post.addHashtags(result.map((v) => v[0]))
        }
        // 2-4. 이미지 처리
        if (req.body.image) {
            if (Array.isArray(req.body.image)) {
                // 이미지를 여러 개 올리면 image: [제로초.png, 부기초.png]
                const images = await Promise.all(
                    req.body.image.map((image) => Image.create({ src: image }))
                )
                await post.addImages(images)
            } else {
                // 이미지를 하나만 올리면 image: 제로초.png
                const image = await Image.create({ src: req.body.image })
                await post.addImages(image)
            }
        }
        // 2-5. 게시글 상세정보조회
        const fullPost = await Post.findOne({
            where: { id: post.id },
            include: [
                {
                    model: Image,
                },
                {
                    model: Comment,
                    include: [
                        {
                            model: User, // 댓글 작성자
                            attributes: ['id', 'nickname'],
                        },
                    ],
                },
                {
                    model: User, // 게시글 작성자
                    attributes: ['id', 'nickname'],
                },
                {
                    model: User, // 좋아요 누른 사람
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
        })
        res.status(201).json(fullPost)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

// 로그인했는지 상태확인.
// upload.array('image'): multer 라이브러리를 사용하여 여러 이미지를 처리합니다.
// array 메서드는 하나의 필드(image)에 다중 파일을 업로드할 때 사용됩니다.
router.post('/images', isLoggedIn, upload.array('image'), (req, res, next) => {
    // POST /post/images
    console.log(req.files)  // 업로드된 파일은 업로드된 파일들은 req.files에 저장
    res.json(req.files.map((v) => v.filename))
})

/////////////////////////////////////////////////////////////
//2. 리트윗
//POST : localhost:3065/post/게시글번호/retweet
//POST : localhost:3065/post/게시글번호/retweet
/*
1. three@three.com     ,  three 으로 로그인
2. Header  cookie 설정
3. localhost:3065/post/1/retweet
*/
// 2-1. 로그인 했는지 확인인
router.post('/:postId/retweet', isLoggedIn, async (req, res, next) => {
    // POST /post/1/retweet
    try {
        //2-2. 기존게시글 확인
        const post = await Post.findOne({
            where: { id: req.params.postId },
            include: [
                {
                    model: Post,
                    as: 'Retweet',
                },
            ],
        })
        if (!post) {
            return res.status(403).send('존재하지 않는 게시글입니다.')
        }
        //2-3. 리트윗제한조건확인
        //  유저가 사용자가 작성한 글인지 확인  || 리트윗한 게시글이  사용자의 글인지 확인
        if (
            req.user.id === post.UserId ||
            (post.Retweet && post.Retweet.UserId === req.user.id)
        ) {
            return res.status(403).send('자신의 글은 리트윗할 수 없습니다.')
        }

        //2-4. 리트윗대상 id설정 - 리트윗대상이 원게시글인지, 기존 리트윗 게시글인지 확인
        const retweetTargetId = post.RetweetId || post.id

        // 2-5. 중복리트윗 여부확인
        // 동일한 게시글을 이미 리트윗했는지 확인 .
        const exPost = await Post.findOne({
            where: {
                UserId: req.user.id,
                RetweetId: retweetTargetId,
            },
        })
        if (exPost) {
            return res.status(403).send('이미 리트윗했습니다.')
        }



        //2-6. 리트윗 생성
        // 새로운 게시글을 생성하면서 RetweetId 필드에 리트윗대상 id를 저장
        const retweet = await Post.create({
            UserId: req.user.id,
            RetweetId: retweetTargetId,
            content: 'retweet',
        })

        //2-7. 리트윗된 게시글과 연관된 데이터 포함 응답
        // 리트윗된 게시글의 상세조회를 조회
        const retweetWithPrevPost = await Post.findOne({
            where: { id: retweet.id },
            include: [
                {
                    model: Post,
                    as: 'Retweet',
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'nickname'],
                        },
                        {
                            model: Image,
                        },
                    ],
                },
                {
                    model: User,
                    attributes: ['id', 'nickname'],
                },
                {
                    model: Image,
                },
                {
                    model: Comment,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'nickname'],
                        },
                    ],
                },
            ],
        })
        res.status(201).json(retweetWithPrevPost)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

/////////////////////////////////////////////////////////////
//3. 사용자 댓글
// POST   localhost:3065/1/comment
/*
1. three@three.com   /  three  로그인

localhost:3065/post/1/comment
2. Header  쿠키설정
3. Body에 댓글내용 입력
{
    "content": "게시글퍼가요!"
}
*/
//3-1. 로그인을 했다면 댓글사용가능
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
    // POST /post/1/comment
    try {
        // 3-2. 게시물존재확인
        const post = await Post.findOne({
            where: { id: req.params.postId },
        })
        if (!post) {
            return res.status(403).send('존재하지 않는 게시글입니다.')
        }
        // 3-3. 댓글생성
        const comment = await Comment.create({
            content: req.body.content,  // 클라이언트가 전달한 댓글내용
            PostId: parseInt(req.params.postId, 10),  // 댓글이 작성될 게시글 id
            UserId: req.user.id,  //현재 로그인 된 사용자의 id
        })
        //3-4. 댓글 상세정보조회
        const fullComment = await Comment.findOne({
            where: { id: comment.id },
            include: [
                {
                    model: User,
                    attributes: ['id', 'nickname'],  // 댓글작성자정보 id, nickname 포함
                },
            ],
        })
        res.status(201).json(fullComment)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

/////////////////////////////////////////////////////////////
/// 4.  좋아요 추가
// PATCH   localhost:3065/post/1/like
/*
1. three@three.com   /  three  로그인

localhost:3065/post/1/like
2. Header  쿠키설정

*/
// 4-1. 로그인 했는지 확인
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => {
    // PATCH /post/1/like
    try {
        //4-2. 게시글존재여부확인
        const post = await Post.findOne({ where: { id: req.params.postId } })
        if (!post) {
            return res.status(403).send('게시글이 존재하지 않습니다.')
        }
        //4-3. 좋아요 추가
        await post.addLikers(req.user.id)
        //4-4. 클라이언트 응답 - 게시글id와 사용자id를 포함한 json 데이터를 반환
        res.json({ PostId: post.id, UserId: req.user.id })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

/////////////////////////////////////////////////////////////
/// 5.  좋아요 삭제
// DELETE   localhost:3065/post/1/like
// 5-1. 로그인 했는지 확인
/*
1. three@three.com   /  three  로그인

DELETE   localhost:3065/post/1/like
2. Header  쿠키설정

*/
// 5-1. 로그인 했는지 확인
router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
    // DELETE /post/1/like
    try {
        //5-2. 게시글존재여부확인
        const post = await Post.findOne({ where: { id: req.params.postId } })
        if (!post) {
            return res.status(403).send('게시글이 존재하지 않습니다.')
        }
        //5-3. 좋아요 취소
        await post.removeLikers(req.user.id)
        res.json({ PostId: post.id, UserId: req.user.id })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

/////////////////////////////////////////////////////////////
/// 6.  글 수정
router.patch('/:postId', isLoggedIn, async (req, res, next) => { // PATCH /post/10
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    try {
        await Post.update({
            content: req.body.content
        }, {
            where: {
                id: req.params.postId,
                UserId: req.user.id,
            },
        });
        const post = await Post.findOne({ where: { id: req.params.postId } });
        if (hashtags) {
            const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({
                where: { name: tag.slice(1).toLowerCase() },
            }))); // [[노드, true], [리액트, true]]
            await post.setHashtags(result.map((v) => v[0]));
        }
        res.status(200).json({ PostId: parseInt(req.params.postId, 10), content: req.body.content });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/////////////////////////////////////////////////////////////
/// 7.  글 삭제
// DELETE   localhost:3065/post/1
/*
1. test@test.com   /  test  로그인

DELETE   localhost:3065/post/1
2. Header  쿠키설정

*/
// 7-1. 로그인 했는지 확인
router.delete('/:postId', isLoggedIn, async (req, res, next) => {
    // DELETE /post/10
    //7-2. 게시글 삭제
    try {
        await Post.destroy({
            where: {
                id: req.params.postId,  // 삭제하려는 게시글 id
                UserId: req.user.id,  // 게시글작성자
            },
        })  // 삭제글게시글id 와 게시글작성자가 동일하면 삭제
        res.status(200).json({ PostId: parseInt(req.params.postId, 10) })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

/////////////////////////////////////////////////////////////
/// 8.  글 확인
router.get('/:postId', async (req, res, next) => { // GET /post/1
    try {
        const post = await Post.findOne({
            where: { id: req.params.postId },
        });
        if (!post) {
            return res.status(404).send('존재하지 않는 게시글입니다.');
        }
        const fullPost = await Post.findOne({
            where: { id: post.id },
            include: [{
                model: Post,
                as: 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                }, {
                    model: Image,
                }]
            }, {
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: User,
                as: 'Likers',
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
            }, {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                }],
            }],
        })
        res.status(200).json(fullPost);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router