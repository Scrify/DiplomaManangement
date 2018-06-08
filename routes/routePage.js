let login = require('../controllers/login'),
    renderPage = require('../controllers/renderPage');

module.exports = function (app) {

    app.route('/')
        .get(renderPage.renderLogin);

    app.route('/total')
        .get(renderPage.renderTotal);

    app.route('/buy')
        .get(renderPage.renderBuy);

    app.route('/view_details')
        .get(renderPage.renderViewDetails);

};