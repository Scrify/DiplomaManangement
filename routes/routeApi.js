let api = require('../controllers/api');
module.exports = function (app) {

    app.route('/login')
        // .get(total.render)
        .post(api.login);

    app.route('/logout')
        .get(api.logout);

    app.route('/api')
        .get(api.api);


    app.route('/getIncomeAndProfit')
        .get(api.getIncomeAndProfit);

    app.route('/getLastValue')
        .get(api.getLastValue);
};