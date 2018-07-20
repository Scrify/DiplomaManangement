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
global.block_num = [];
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
app.use(express.urlencoded({extended: false}));
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

//event.js 文件
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();

app.set('event', event);


// // 服务初始化
// (async () => {
//     let fc = await FConn.FConnect('admin');
//     fc_list['admin'] = fc;

//     let t1 = new Date().getTime();
//     // 初始化所有交易缓存，该过程只需要进行一次
//     txall = await fc.mytxall("2");

//     let t2 = new Date().getTime();
//     //初始化最后一个区块编号
//     block_num['admin'] = await fc.getBlocknum();

//     //设置遍历时间
//     time = t2 - t1;

//     let eh = fc.client.newEventHub();
//     eh.setPeerAddr(fc.event_url, fc.grpcOpts);
//     let num = eh.registerBlockEvent((block) => {
//             // console.log(io);
//             (async () => {
//                 try {
//                     let fc = fc_list['admin'];
//                     let first_tx = block.data.data[0]; // get the first transaction
//                     let header = first_tx.payload.header; // the "header" object contains metadata of the transaction
//                     let channel_id = header.channel_header.channel_id;
//                     if (fc.channel_id !== channel_id) return; //过滤一个信道上的区块
//                     let now_block_number = Number(block.header.number);
//                     console.log("监听到新区块，编号为", now_block_number);
//                     if (now_block_number + 1 > block_num['admin']) {
//                         let t1 = new Date().getTime();
//                         let add_txall = await fc_list['admin'].mytxall(block_num['admin'].toString());
//                         let t2 = new Date().getTime();
//                         time += t2 - t1;
//                         for (let add_tx of add_txall) {
//                             txall.push(add_tx)
//                         }
//                         block_num['admin'] = now_block_number + 1;
//                         event.emit('getNewBlock');
//                     }
//                 } catch (err) {
//                     console.log("更新区块变化失败：", err);
//                 }
//             })();
//         },
//         (err) => {
//             console.log('监听出错:', err);
//         }
//     );
//     await eh.connect();
//     console.log('正在监听新区块，Ctrl+c退出监听，也退出fnc');
// })();

module.exports = app;
