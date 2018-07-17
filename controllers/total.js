/**
 * Created by coofly on 2014/7/12.
 */
var io = require('socket.io')();

io.sockets.on('connection', function (_socket) {
    _socket.on('buy', function (username, cmd) {
        let fc = fc_list[username];
        (async()=>{
            try {
                cmd = 'fc.'+cmd;
                let ret = await eval(cmd);
                _socket.emit('buy', {
                    code: 200,
                    message: '购买成功！'
                });
                let t1 = new Date().getTime();
                let add_txall = await fc_list['admin'].mytxall(block_num.toString());
                let t2 = new Date().getTime();
                time += t2-t1;
                for (let add_tx of add_txall){
                    txall.push(add_tx)
                }

                _socket.broadcast.emit('to_update');
            }catch (e) {
                console.log(e);
            }
        })();
    });

    _socket.on('progress', function (old_bnum) {
        setTimeout(function() {
            let progress = {
                name: 'progress',
                bnum: old_bnum+1,
                percent: Math.floor((old_bnum+1)/block_num * 100),
                total_num: block_num
            };
            _socket.emit('progress', progress);
        }, time/(block_num*2));
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
                    _socket.emit('progress', progress);

                    let mytx = await fc.mytx("2");
                    let mytx_id = [];
                    for (let tx of mytx){
                        mytx_id.push(tx.tx_id);
                    }
                    user_tx_id[username] = mytx_id;
                }

                //获取当前区块个数
                let now_block_num = await fc.getBlocknum();

                //当前区块个数大于缓存中区块号则更新用户个人交易
                if (now_block_num > block_num){
                    let t1 = new Date().getTime();
                    let add_mytx = await fc.mytx(block_num.toString());
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
                            now_block_num > block_num){

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
                    block_num = now_block_num;

                } //以上计算比较复杂，能否简化？
                _socket.emit('update_info_box', {
                    'income': income,
                    'profit': profit,
                    'buyin': buyin
                });
                _socket.emit('update_sold_out', data);

                let market = [];   //行情数据
                for (let tx of txall) {
                    // console.log(tx);
                    let write_set = tx.writeset;
                    let timestamp = tx.timestamp;
                    let value = write_set[0].value;
                    market.push({
                        'timestamp': timestamp,
                        'value': value
                    });
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
                let now_block_num = await fc.getBlocknum();

                if (historys === undefined ||
                    historys[bid] === undefined ||
                    now_block_num > block_num){

                    //更新货币历史
                    let the_history = await fc.query("history", bid); //key历史
                    the_history = JSON.parse(the_history);
                    historys[the_b['key']]= the_history;
                }


                var ret = await fc.mykeyhistory(bid);
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