exports.renderLogin = function (req, res) {

    // console.log('1');
    res.render('login', {
        title: 'Login',
        messages:null
    });
    // next()
};

exports.renderBuy = function (req, res) {

    if (!req.session.username) {
        res.render('login', {
            title: 'Login',
            messages: 'un login'
        });
    } else {
        // console.log('total');
        res.render('buy', {
            title: 'Buy',
            username: req.session.username ? req.session.username : null
        });
    }
};

exports.renderTotal = function (req, res, next) {
    // console.log('1');
    if (!req.session.username) {
        res.render('login', {
            title: 'Login',
            messages: 'un login'
        });
    } else {
        // console.log('total');
        res.render('total', {
            title: 'Total',
            username: req.session.username ? req.session.username : null
        });
    }
};

exports.renderViewDetails = function (req, res, next) {
    // console.log('1');
    if (!req.session.username) {
        res.render('login', {
            title: 'Login',
            messages: 'un login'
        });
    } else {
        // console.log('total');
        res.render('view_details', {
            title: 'Details',
            username: req.session.username ? req.session.username : null,
            // messages: null
        });
    }
};