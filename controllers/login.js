var FConn = require('./fconn');

exports.login = function (req, res, next) {
    let username = req.body.username;
    // console.log(username);
    // next()
    (async()=>{
        try {
            var fc = await FConn.FConnect(username);
            if (fc === undefined){
                return res.render('login',{
                    title:'Login',
                    messages:'unregister username'
                });
            }else {
                req.session.username = username;
                return res.redirect('total');
            }
        }catch (err) {
            if (err.startsWith('指定用户名不存在')){
                return res.redirect('/');
            }
        }
    })();
};