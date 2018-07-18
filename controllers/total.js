/**
 * Created by coofly on 2014/7/12.
 */
var io = require('socket.io')();
var app = require('../app');
io.sockets.on('connection', function (_socket) {

    let event = app.get('event');

    event.on('getNewBlock', function () {
        _socket.emit('to_update')
    });

    _socket.on('buy', function (username, cmd) {
        let fc = fc_list[username];
        (async()=>{
            try {
                cmd = 'fc.'+cmd;
                let ret = eval(cmd);
                _socket.emit('buy', {
                    code: 200,
                    message: '提交交易成功！'
                });
            }catch (e) {
                console.log(e);
            }
        })();
    });

    _socket.on('progress', function (old_bnum, username) {
        setTimeout(function() {
            let progress = {
                name: 'progress',
                bnum: old_bnum<block_num[username]?old_bnum+1:old_bnum,
                percent: old_bnum<block_num[username]?Math.floor((old_bnum+1)/block_num[username] * 100):99.99,
                total_num: block_num[username]
            };
            _socket.emit('progress', progress);
        }, time/(block_num[username]*2));
    });

    _socket.on('update', function (username) {
        console.log('socket:'+ username);
        (async () => {
            try {
                //获取登录用户的中间件连接
                var fc = fc_list[username];

                //初始化当前登录用户交易
                if (user_tx_id[username] === undefined){
                    // 初始化进度棒
                    let progress = {
                        name: 'progress',
                        bnum:1,
                        percent: 1
                    };
                    block_num[username] = await fc.getBlocknum();
                    _socket.emit('progress', progress);
                    let mytx = await fc.mytx("2");
                    let mytx_id = [];
                    for (let tx of mytx){
                        mytx_id.push(tx.tx_id);
                    }
                    user_tx_id[username] = mytx_id;
                }
                //当前区块个数大于缓存中区块号则更新用户个人交易
                if (block_num[username] < block_num['admin']){
                    let t1 = new Date().getTime();
                    let add_mytx = await fc.mytx(block_num[username].toString());
                    let t2 = new Date().getTime();
                    time += t2-t1;
                    for (let tx of add_mytx){
                        user_tx_id[username].push(tx.tx_id);
                    }
                }

                //更新两个表和总市值
                var ret = await fc.mykeys("bid01", "bid99");
                // console.log(ret);
                _socket.emit('update_table', ret);

                let profit = 0; //利润
                let income = 0; //卖出总价
                let buyin = 0; //买入总价
                let data = []; //卖出的交易

                for (let mytx_id of user_tx_id[username]) {           //遍历当前用户的所有tx_id
                    let my_tx = {};              //比对到的交易信息
                    for (let tx of txall){          //从所有的交易缓存中查找当前交易信息
                        if (tx.tx_id === mytx_id){
                            my_tx = tx;
                            break;
                        }
                    }
                    let writeset = my_tx.writeset;    //得到当前交易中的写集

                    for (let the_b of writeset) {
                        let the_tx_value = 0;
                        let now_value = 0;
                        //let the_history = await eval('fc.query("history","' + the_b['key'] + '")');

                        if (historys === undefined ||
                            historys[the_b['key']] === undefined ||
                            block_num[username] < block_num['admin']){

                            //更新货币历史
                            let the_history = await fc.query("history", the_b['key']); //key历史
                            the_history = JSON.parse(the_history);
                            historys = {};
                            historys[the_b['key']]= the_history;
                        }


                        let the_history = historys[the_b.key];
                        let count = 0;
                        for (let k = 0; k < the_history.length; k++) {

                            if (the_history[k].txid === mytx_id) {
                                count = k;
                            }
                        }
                        //此时count指向买入交易
                        //the_tx_value = Number(the_history[count]['value']); //买入价格
                        the_tx_value = Number(the_history[count].value); //买入价格
                        buyin += the_tx_value;
                        if (count !== (the_history.length - 1)) { //买入交易是否为最后交易
                            let sold_out = the_history[count + 1];
                            now_value = Number(sold_out.value); //若不是，下一个交易就是卖出，取卖出价格
                            sold_out.isBuy = false;
                            sold_out.key = the_b.key;
                            data.push(sold_out);
                            income += now_value;
                            profit += (now_value - the_tx_value);
                        }
                    }

                    // 更新区块数量
                    block_num[username] = block_num['admin'];

                } //以上计算比较复杂，能否简化？
                _socket.emit('update_info_box', {
                    'income': income,
                    'profit': profit,
                    'buyin': buyin
                });
                _socket.emit('update_sold_out', data);

                let market = [];   //行情数据
                let total_tx_num = txall.length;
                for (let i in txall) {
                    // console.log(tx);
                    let write_set = txall[total_tx_num-i-1].writeset;
                    let timestamp = txall[total_tx_num-i-1].timestamp;
                    let value = write_set[0].value;
                    market.push({
                        'timestamp': timestamp,
                        'value': value
                    });
                    if (market.length > 30){
                        break;
                    }
                }
                _socket.emit('update_line', market);
            } catch (err) {
                console.error(err);
            }
        })();
    });

    _socket.on('update_details',function(username, bid){
        console.log(username);
        console.log("bid: " + bid);
        (async () => {
            try{

                let fc = fc_list[username];

                if (historys === undefined ||
                    historys[bid] === undefined ||
                    block_num[username] < block_num['admin']){

                    //更新货币历史
                    let the_b_history = await fc.query("history", bid); //key历史
                    the_b_history = JSON.parse(the_b_history);
                    historys[bid]= the_b_history;
                }


                let the_b_history = historys[bid];
                let ret = [];
                console.log(typeof user_tx_id[username]);
                for (let the_history of the_b_history){
                    if (user_tx_id[username].indexOf(the_history.txid) !== -1){
                        the_history.isMine = true;
                    }else{
                        the_history.isMine = false;
                    }
                    ret.push(the_history);
                }
                // console.log(ret);
                _socket.emit('update_details', ret);
            }catch(err){
                console.error(err);
            }
        })();
    });
});

exports.listen = function (_server) {
    return io.listen(_server);
};