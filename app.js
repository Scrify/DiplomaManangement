var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session');

var FConn = require('./controllers/fconn');

global.fc_list = {};
global.txall = [];
global.user_tx_id = {};
global.historys = {};
global.block_num = 0;
global.time = 0;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// var loginRouter = require('./routes/login');
// var usersRouter = require('./routes/users');

var app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
    app.use(compress());
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'developmentSessionSecret'
}));

app.use(express.static(path.join(__dirname, 'public')));

app.engine('.html', require('ejs').__express);
app.set('views', './public');
app.set('view engine', 'html');

require('./routes/routeApi.js')(app);
require('./routes/routePage.js')(app);
// require('./routes/api.js')(app);
// app.use('/users', usersRouter);

// 服务初始化
(async () => {
    let fc = await FConn.FConnect('admin');
    fc_list['admin'] = fc;

    let t1 = new Date().getTime();
    // 初始化所有交易缓存，该过程只需要进行一次
    global.txall = await fc.mytxall("2");

    let t2 = new Date().getTime();
    //初始化最后一个区块编号
    global.block_num = await fc.getBlocknum();

    //设置遍历时间
    global.time = t2-t1;
})();

module.exports = app;
