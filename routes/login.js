let login = require('../controllers/login');

module.exports = function (app) {

    app.route('/login')
        // .get(total.render)
        .post(login.login);
};