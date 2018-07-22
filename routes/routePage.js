/**
 * 针对页面的请求路由，将{路径，post/get}映射到一个控制方法
 */
let renderPage = require('../controllers/renderPage');

module.exports = function (app) {

    app.route('/')
        .get(renderPage.renderTotal);

    app.route('/login')
        .get(renderPage.renderLogin);

    app.route('/register')
        .get(renderPage.renderRegister);

    app.route('/oneinput')
        .get(renderPage.renderOneinput);

    app.route('/onemodify')
        .get(renderPage.renderOnemodify);

    app.route('/total')
        .get(renderPage.renderTotal);

    app.route('/conductor')
        .get(renderPage.renderConductor);

    app.route('/count')
        .get(renderPage.renderCount);

    app.route('/sample')
        .get(renderPage.renderSample);

    app.route('/information')
        .get(renderPage.renderInformation);

    app.route('/revoke')
        .get(renderPage.renderRevoke);

    app.route('/excel')
        .get(renderPage.renderExcel);

    app.route('/count')
        .get(renderPage.renderCount);


};