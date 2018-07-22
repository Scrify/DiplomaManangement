/**
 * 响应客户端api请求，调用API，返回json结果作为响应
 * 注意，方法名应与routeApi.js保持一致
 * 额外，login将重定向到total页面，logout将渲染login页面
 * 可响应：
 * [1]Web客户端的ajax请求
 * [2]移动客户端的http请求
 * 注意，可利用session保存一些区块数据，减少API调用，以提高性能
 */
var FConn = require('./fconn');
var crypto = require('crypto');

var MongoClient = require("mongodb").MongoClient;
var DBurl = 'mongodb://localhost:27017/myproject';
const assert = require('assert');
var mgclient = null;

exports.login = function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    (async () => {
        try {
            mgclient = await MongoClient.connect(DBurl);
            let col = mgclient.db().collection('users');
            //查询mongodb并与输入的帐号密码进行匹配。
            let docs = await col.find({
                "_id": username
            }).toArray();
            mgclient.close();
            let docsStr = docs.join();
            if (docsStr === "") {
                //throw new Error('用户不存在');
                return res.render('login', {
                    title: 'Login',
                    messages: '未注册用户'
                });
            } else {
                password = crypto.pbkdf2Sync(password, 'njustXP2018', 10000, 64, 'md5').toString('base64');
                if (username === docs[0]._id && password === docs[0].pwd) {
                    req.session.username = username;
                    //fc_list[username] = fc;
                    (async () => {
                        let fc = await FConn.FConnect(username);
                        fc_list[username] = fc;
                        return res.redirect('conductor');
                        // return res.redirect('excel');

                    })()
                } else {
                    return res.render('login', {
                        title: 'Login',
                        messages: '密码错误'
                    });
                }
            }
        } catch (err) {
            console.log('连接出错：', err);
            if (err) {
                return res.render('login', {
                    title: 'Login',
                    messages: err
                });
            }
        }
    })()
};

exports.logout = function (req, res, next) {
    let username = req.session.username;
    delete fc_list[username];
    req.session.destroy();
    return res.render('login', {
        title: 'Login',
        messages: '已退出!'
    });
};


exports.confirm = function (req, res, next) {
    let username = req.body.username;
    console.log(username);
    try {
        (async () => {
            mgclient = await MongoClient.connect(DBurl);
            let col = mgclient.db().collection('users');
            let docs = await col.find({
                "_id": username
            }).toArray();
            let docsStr = docs.join();
            if (docsStr === "") {
                // var e = true;
                res.write('true');
            } else {
                res.write('false');
            }
            res.end();
            mgclient.close();

        })()
    } catch (err) {}
};
exports.register = function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    var register = require('../../fabcar/registerUser');
    var file = 'crtuser.json';
    (async () => {
        try {
            //begin
            mgclient = await MongoClient.connect(DBurl);
            let col = mgclient.db().collection('users');
            let cert = await register.registerUser(file, username); //cert
            // console.log(cert);
            let salt = 'njustXP2018';
            password = crypto.pbkdf2Sync(password, salt, 10000, 64, 'md5').toString('base64');
            let write = {
                _id: username,
                pwd: password,
                ca: cert.toString(),
                isValid: true
            };
            let r = await col.insertOne(write);
            const assert = require('assert');
            assert.equal(1, r.insertedCount);
            mgclient.close();
            return res.render('login', {
                title: 'Login',
                messages: '注册成功'
            });

            //end
        } catch (err) {
            console.log('注册出错:', err);
            return res.render('register', {
                title: 'Register',
                messages: '注册失败：' + err
            });
        }
    })()
};


exports.getMyTxHistory = function (req, res) {
    var username = req.session.username;
    // console.log(username);
    if (username === null) {
        return res.render('login', {
            title: 'Login',
            messages: '请先登录!'
        });
    }
    let data = [];
    (async () => {
        try {
            let fc = fc_list[username];
            //let mytx = await eval('fc.mytx()');
            //注意，函数mytx要遍历整条链，如果超过1000个区块，页面就挂了，可能超过10秒
            //相同页面上已经调用过一次
            //建议页面上用一个进度条显示进度，然后用session保存一个数组mytx，以后每次购买完成之后都mytx.push(新交易)
            //用增量更新来避免完整更新，以改善性能
            let mytx = await fc.mytx();
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
                    //let the_history = await eval('fc.query("history","' + the_b['key'] + '")');

                    //把买入加到返回的json数组里。
                    the_b.timestamp = tx.timestamp;
                    the_b.isBuy = true;

                    data.push(the_b);

                    let the_history = await fc.query("history", the_b['key']); //key历史
                    the_history = JSON.parse(the_history);

                    //找是否卖出

                    let count = 0;
                    for (let k = 0; k < the_history.length; k++) {
                        //console.log(the_history[k]);
                        //if (the_history[k]['txid'] === now_txid) {
                        if (the_history[k].txid === now_txid) {
                            count = k;
                        }
                    }
                    if (count !== (the_history.length - 1)) {
                        let the_sell = {};
                        the_sell.key = the_b.key;
                        the_sell.is_delete = the_history[count + 1].isDelete;
                        the_sell.value = the_history[count + 1].value;
                        the_sell.timestamp = the_history[count + 1].timestamp;
                        the_sell.isBuy = false;
                        data.push(the_sell);
                    }

                }
            } //以上计算比较复杂，能否简化？

            res.write(JSON.stringify(data));

        } catch (err) {
            console.error(err);
            res.write('错误:' + err); //?

        }
        res.end();
    })();
};

//通用API调用， 比如 /?cmd=query('history','bid01')
exports.api = function (req, res, next) {
    var username = req.session.username;
    console.log(username);
    if (username === null) {
        return res.render('login', {
            title: 'Login',
            messages: '请先登录!'
        });
    }
    (async () => {
        try {
            var fc = fc_list[username];
            var cmd1 = 'fc.' + req.query.cmd;
            var cmd2 = 'fc.' + req.body.cmd;
            //var length = req.body.length;
            var cmd = '';
            if (cmd1 == 'fc.undefined') { //post方法
                cmd = cmd2;
                // console.log(cmd);
            } else { //get方法
                cmd = cmd1;
                // console.log(cmd);
            }
            console.log(cmd);
            if (cmd.startsWith('fc.invoke')) {
                eval(cmd); //注意，invoke调用也可能有返回，但invoke(put,k,v)无返回
                res.write('录入成功！');
            } else {
                var ret = await eval(cmd);
                if (ret !== undefined) {
                    res.write(JSON.stringify(ret));
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
exports.getAllTx = function (req, res, next) {
    var username = req.session.username;
    console.log("username=" + username);
    if (username == null) {
        return res.render('login', {
            title: 'Login',
            messages: '请先登录!'
        });
    }
    (async () => {
        try {
            let fc = fc_list[username];

            let mytx = await fc.mytxall("1");
            let tx = [];

            for (let k = 1; k < mytx.length; k++) {

                let writeset = mytx[k].writeset;
                let timestamp = mytx[k].timestamp;
                value = writeset[0].value;
                tx.push({
                    'timestamp': timestamp,
                    'value': value
                });
            }
            res.write(JSON.stringify(tx));

        } catch (err) {
            console.error(err);
            res.write('错误:' + err);
        }
        res.end();
    })();
};

exports.getCert = function (req, res, next) {
    let zsbh = req.body.zsbh;
    let zslb = req.body.zslb;
    console.log('zsbh=', zsbh);
    (async () => {
        try {
            let fc = fc_list['admin'];
            if (fc == undefined) {
                fc = await FConn.FConnect('admin');
                fc_list['admin'] = fc;
            }
            var key = zslb + zsbh;
            let re = await fc.query("get", key);
            return res.render('information', {
                title: 'Information',
                messages: re
            });
        } catch (err) {
            console.log("Fabric连接出错或执行出错", err);
        }
    })();
};

exports.getModify = function (req, res, next) {
    var username = req.session.username;
    console.log("username=" + username);
    if (username == null) {
        return res.render('login', {
            title: 'Login',
            messages: '请先登录!'
        });
    }
   
    (async () => {
        try {
            let fc = fc_list[username];
            let zsbh = req.body.zsbh;
            let zslb = req.body.zslb;
            console.log('zsbh=', zsbh);
            var key = zslb + zsbh;
            let re = await fc.query("get", key);
            console.log(re);
            res.write(re);
        } catch (err) {
            console.error(err);
            res.write('错误:' + err);
        }
        res.end();
    })();
};


exports.remove = function (req, res, next) {
    var username = req.session.username;
    console.log("username=" + username);
    if (username === null) {
        return res.render('login', {
            title: 'Login',
            messages: '请先登录!'
        });
    }
    (async () => {
        try {
            let fc = fc_list[username];
            let key = req.query.key;
            let reason = req.query.reason;
            let curtx = await fc.query("get", key);
            // let msg = eval('(' + curtx + ')');
            // console.log(msg);
            if (!curtx) {
                res.write('无此证书！');
            } else if (eval('(' + curtx + ')').status) {
                res.write('该证书已被撤销！');
            } else {
                result = JSON.parse(curtx);
                result.status = "撤销";
                result.reason = reason;
                console.log(result);
                fc.invoke("put", key, JSON.stringify(result));
                res.write('撤销成功！');
            }
        } catch (err) {
            console.error(err);
            res.write('错误:' + err);
        }
        res.end();
    })();
};