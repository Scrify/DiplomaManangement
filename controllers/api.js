var FConn = require('./fconn');
exports.api = function (req, res, next) {

    var username = req.session.username;

    (async () => {
        try {
            // let ret = await eval(cmd);
            var fc = await FConn.FConnect(username);
            var cmd = 'fc.'+req.query.cmd;
            console.log(cmd);

            if (cmd.startsWith('fc.invoke')) {
                eval(cmd);
                res.write('invoke ok');
            }else{
                var ret = await eval(cmd);
                if (ret !== undefined) {
                    // console.log(ret);
                    res.write(JSON.stringify(ret))
                    // res.write(ret)
                }
            }

        } catch (err) {
            console.error("输入方法名或实参错误:", err);
            res.write('错误:' + cmd); //?
            //res.end(err.stringify()) //输出?
        }
        res.end();
    })();
};