const express = require('express');  //##
const router  = express.Router();  //##

//4. 경로  /test/posts
router.get('/posts', (req, res) => {
  res.json([
    {  id: 1, content: 'one' },   {  id: 2, content: 'two' },  {  id: 3, content: 'three' },
  ]);
});

//5. 경로  /test/posts
router.post('/posts', (req, res) => {
  res.json([  {  id: 1, content: 'one' },   {  id: 2, content: 'two' },   ]);
});

//6. 경로  /test/posts
router.delete('/posts', (req, res) => {
  res.json([
    {  id: 1, content: 'one' }, 
  ]);
});

module.exports = router;  //##
