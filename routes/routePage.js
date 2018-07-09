/**
 * 针对页面的请求路由，将{路径，post/get}映射到一个控制方法
 */
let renderPage = require('../controllers/renderPage');

module.exports = function (app) {

    app.route('/')
        .get(renderPage.renderLogin);

    app.route('/register')
        .get(renderPage.renderRegister);

    app.route('/total')
        .get(renderPage.renderTotal);

    app.route('/buy')
        .get(renderPage.renderBuy);

    app.route('/view_details')
        .get(renderPage.renderViewDetails);

};