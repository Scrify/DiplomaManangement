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
                var fc = fc_list[username];
                var ret = await fc.mykeys("bid01", "bid99");
                // console.log(ret);
                _socket.emit('update', ret);
            } catch (err) {
                console.error(err);
            }
        })();
    });
});

exports.listen = function (_server) {
    return io.listen(_server);
};