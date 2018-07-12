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
                _socket.broadcast.emit('to_update');
            }catch (e) {
                console.log(e);
            }
        })();
    });
    _socket.on('to_update',function(){
        _socket.broadcast.emit('to_update');
    });
    
    _socket.on('update', function (username) {
        console.log('socket:'+ username);
        (async () => {
            try {
                //更新两个表和总市值
                var fc = fc_list[username];
                var ret = await fc.mykeys("bid01", "bid99");
                // console.log(ret);
                _socket.emit('update_table', ret);

                //更新买入,卖出,利润
                let mytx = await fc.mytx();
                let profit = 0; //利润
                let income = 0; //卖出总价
                let buyin = 0; //买入总价
                //for (let i = 0; i < mytx.length; i++) { //每个交易
                //    let tx = mytx[i];
                for (let tx of mytx) {
                    //let now_txid = tx['tx_id'];
                    let now_txid = tx.tx_id;
                    //let writeset = tx['writeset'];
                    let writeset = tx.writeset;
                    //console.log(now_txid);
                    //for (let j = 0; j < writeset.length; j++) { //每一个key=bidXX
                    //    let the_b = writeset[j];
                    for (let the_b of writeset) {
                        let the_tx_value = 0;
                        let now_value = 0;
                        //let the_history = await eval('fc.query("history","' + the_b['key'] + '")');
                        let the_history = await fc.query("history", the_b['key']); //key历史
                        the_history = JSON.parse(the_history);
                        let count = 0;
                        for (let k = 0; k < the_history.length; k++) {
                            //console.log(the_history[k]);
                            //if (the_history[k]['txid'] === now_txid) {
                            if (the_history[k].txid === now_txid) {
                                count = k;
                            }
                        }
                        //此时count指向买入交易
                        //the_tx_value = Number(the_history[count]['value']); //买入价格
                        the_tx_value = Number(the_history[count].value); //买入价格
                        buyin += the_tx_value;
                        if (count !== (the_history.length - 1)) { //买入交易是否为最后交易
                            now_value = Number(the_history[count + 1].value); //若不是，下一个交易就是卖出，取卖出价格
                            income += now_value;
                            profit += (now_value - the_tx_value);
                        }
                    }
                } //以上计算比较复杂，能否简化？
                _socket.emit('update_info_box', {
                    'income': income,
                    'profit': profit,
                    'buyin': buyin
                });

                let mytxall = await fc.mytxall("1");
                let tx = [];
    
                for (let k = 1; k < mytxall.length; k++) {
    
                    let writeset = mytxall[k].writeset;
                    let timestamp = mytxall[k].timestamp;
                    let value = writeset[0].value;
                    tx.push({
                        'timestamp': timestamp,
                        'value': value
                    });
                }
                _socket.emit('update_line', tx)
            } catch (err) {
                console.error(err);
            }
        })();
    });
});

exports.listen = function (_server) {
    return io.listen(_server);
};