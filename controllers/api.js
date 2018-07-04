var FConn = require('./fconn');

exports.login = function (req, res, next) {
    let username = req.body.username;
    // console.log(username);
    // next()
    (async () => {
        try {
            let fc = await FConn.FConnect(username);
            if (fc === undefined) {
                return res.render('login', {
                    title: 'Login',
                    messages: '未注册用户'
                });
            } else {
                req.session.username = username;
                fc_list[username] = fc;
                return res.redirect('total');
            }
        } catch (err) {
            // console.error(err);
            if (err) {
                return res.render('login', {
                    title: 'Login',
                    messages: err
                });
            }
        }
    })();
};

exports.logout = function (req, res, next) {
    let username = req.session.username;
    delete fc_list[username];
    req.session.destroy();
    return res.render('login', {
        title: 'Login',
        messages: '注销成功!'
    });
};

exports.getLastValue = function (req, res, next) {
    var username = req.session.username;
    // console.log(username);
    if (username === null) {
        return res.render('login', {
            title: 'Login',
            messages: '未登录，请先登录使用!'
        });
    }
    (async () => {
        try {
            let fc = fc_list[username];
            let mykeys = await eval('fc.mykeys("bid00","bid99")');
            let count = 0;
            for (let key in mykeys) {
                if (mykeys[key]['isMine'] === true) {
                    count += 1;
                }
            }
            let last_tx_value_max = 0;
            let last_tx = await eval('fc.mytxlast()');
            console.log(last_tx);
            last_tx['writes'].forEach(function (write) {
                last_tx_value_max = Number(write['value']) > last_tx_value_max ? Number(write['value']) : last_tx_value_max;
                console.log(last_tx_value_max);
            });


            res.write(JSON.stringify({ 'count': count, 'last_tx_value': last_tx_value_max }));

        } catch (err) {
            console.error(err);
            res.write('错误:' + err); //?
            //res.end(err.stringify()) //输出?
        }
        res.end();
    })();
};

exports.getIncomeAndProfit = function (req, res, next) {
    var username = req.session.username;
    // console.log(username);
    if (username === null) {
        return res.render('login', {
            title: 'Login',
            messages: '未登录，请先登录使用!'
        });
    }
    (async () => {
        try {
            let fc = fc_list[username];
            let mytx = await eval('fc.mytx()');
            let profit = 0;
            let income = 0;
            for (let i = 0; i < mytx.length; i++) {
                let tx = mytx[i];
                let now_txid = tx['tx_id'];
                let writeset = tx['writeset'];
                console.log(now_txid);
                for (let j = 0; j < writeset.length; j++) {
                    let the_b = writeset[j];
                    let the_tx_value = 0;
                    let now_value = 0;
                    let the_history = await eval('fc.query("history","' + the_b['key'] + '")');

                    the_history = JSON.parse(the_history);
                    let count = 0;
                    for (let k = 0; k < the_history.length; k++) {
                        console.log(the_history[k]);
                        if (the_history[k]['txid'] === now_txid) {
                            count = k;
                        }

                    }
                    the_tx_value = Number(the_history[count]['value']);
                    if (count !== (the_history.length - 1)) {
                        now_value = Number(the_history[count + 1]['value']);
                        income += now_value;
                        profit += (now_value - the_tx_value);
                    }
                }
            }
            res.write(JSON.stringify({ 'income': income, 'profit': profit }));

        } catch (err) {
            console.error(err);
            res.write('错误:' + err); //?
            //res.end(err.stringify()) //输出?
        }
        res.end();
    })();

};

exports.api = function (req, res, next) {
    var username = req.session.username;
    // console.log(username);
    if (username === null) {
        return res.render('login', {
            title: 'Login',
            messages: '未登录，请先登录使用!'
        });
    }
    (async () => {
        try {
            // let ret = await eval(cmd);

            var fc = fc_list[username];
            var cmd = 'fc.' + req.query.cmd;
            console.log(cmd);

            if (cmd.startsWith('fc.invoke')) {
                eval(cmd);
                res.write('提交交易成功！');
            } else {
                var ret = await eval(cmd);
                if (ret !== undefined) {
                    // console.log(ret);
                    res.write(JSON.stringify(ret))
                    // res.write(ret)
                }
            }

        } catch (err) {
            console.error(err);
            res.write('错误:' + err); //?
            //res.end(err.stringify()) //输出?
        }
        res.end();
    })();
};