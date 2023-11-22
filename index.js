const { passwUse, generate } = require('./database')

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体
// 使用body-parser中间件解析请求体
app.use(bodyParser.json());

// 处理POST请求
app.post('/', (req, res) => {
  const requestBody = req.body;
  // 对请求体进行处理
  // ...
  console.log('请求来到', requestBody)
  const msg = {
    code: '200',
    msg: '访问成功'
  }
  // 发送响应
  res.send(JSON.stringify(msg));
});

// 处理根路径的GET请求
app.get('/',  async (req, res) => {
  const { type, time, password } = req.query || {}
  console.log(type, '执行开始')
  let result = null
  switch (type) {
    case 'generate':
      result = await generate(time || '1')
      break;
    case 'use':
      result = await passwUse(password)
      break;
    default:
      result = {
        code:'failed',
        msg:'参数异常，请联系管理员'
      }
  }
  console.log(result)
  res.send(result);
});

// 启动服务器
app.listen(port, () => {
  console.log(`元神启动！！！ ====》 ${port}`);
});