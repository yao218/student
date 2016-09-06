var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require('fs');

var app = express();
////引入arttemplate模板
var template = require('art-template');
template.config('base', '');
template.config('extname', '.html');
app.engine('.html', template.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function initApp(req, res, next) {
    /////判断目录是否存在
    fs.exists('./public/uploads', function (d) {
        if (d) {
            console.log('上传目录已存在');
            next();
        }
        else {
            /////创建一个在项目根目录中创建一个notes目录
            fs.mkdirSync('./public/uploads');
            console.log('初始化上传目录完成');
            next();
        }
    })
}

app.use('/common', require('./routes/common'));
app.use('/student',require('./routes/students'));

app.get('/',initApp,(req,res)=>{
  // res.send('app启动');
  res.redirect('/student/list/1');
})


app.listen(3000,(res,req)=>{
  console.log('服务器运行中....')
})
