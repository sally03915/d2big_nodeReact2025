const express = require('express');
const axios = require('axios');
const router = express.Router();

const client_id = 'reu63fdeQl8IXmwLVsRM';
const client_secret = 'AvEnm8FcX2';

router.get('/search', async (req, res) => {
    const api_url = `https://openapi.naver.com/v1/search/blog?query=${encodeURIComponent(req.query.query)}`;

    try {
        const response = await axios.get(api_url, {
            headers: {
                'X-Naver-Client-Id': client_id,
                'X-Naver-Client-Secret': client_secret,
            }
        });

        res.status(200).json(response.data); // 응답 데이터를 JSON 형식으로 반환
    } catch (error) {
        console.error('API 요청 오류:', error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({ error: 'API 요청 실패' });
    }
});

module.exports = router;


/*
const express = require('express');
const router = express.Router();
 
var client_id = 'reu63fdeQl8IXmwLVsRM';
var client_secret = 'AvEnm8FcX2';
router.get('/search', function (req, res) {
  var api_url = 'https://openapi.naver.com/v1/search/blog?query=' + encodeURI(req.query.query);
  // JSON 결과
  //   var api_url = 'https://openapi.naver.com/v1/search/blog.xml?query=' + encodeURI(req.query.query); // XML 결과
   var request = require('request');
   var options = {
       url: api_url,
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
   request.get(options, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
       res.end(body);
     } else {
       res.status(response.statusCode).end();
       console.log('error = ' + response.statusCode);
     }
   });
 });

module.exports = router;
*/ 