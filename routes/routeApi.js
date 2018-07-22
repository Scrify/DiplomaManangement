/**
 * 处理所有api调用，包括login，logout
 * 针对api调用的路由，将{路径，post/get}映射到一个控制方法
 */
let api = require('../controllers/api');
module.exports = function (app) {

    app.route('/login')
        // .get(total.render)
        .post(api.login);

    app.route('/register')
        .post(api.register);

    app.route('/logout')
        .get(api.logout);

    app.route('/confirm')
        .post(api.confirm);
    // app.route('/typerule')
    //     .post(api.typerule);

    app.route('/api')
        .get(api.api);

    app.route('/api')
        .post(api.api);

    app.route('/getCert')
        .post(api.getCert);

    app.route('/getModify')
        .post(api.getModify);

    app.route('/getMyTxHistory')
        .get(api.getMyTxHistory);


    app.route('/getAllTx')
        .get(api.getAllTx);

    app.route('/remove')
        .get(api.remove);

};