
async function FConnect(username){
    var fc = null;
    var fs = require('fs');
// var args = process.argv.splice(2);
    var file = '../fabcar/Fabks.json';
    if (file == null) {
        console.log('需要指定一个连接json文件,如Fabcar.json,或Fabks.json，TLSConn.json');
        return;
    }
//console.log(file);
    var baseconn = JSON.parse(fs.readFileSync(file));

    try {
        var FabKSinvoke = require('../../fabcar/FabKSinvoke');
        fc = new FabKSinvoke();
        await fc.connect(baseconn, username); //args[1]第2个参数可选，一个用户名
        // fc.currentuser();
        return fc
        // req.session.Fab = fc;
    } catch (err) {
        console.error("连接出错", err);
    }

}
// var fc = null;
//
// //console.log(baseconn.peer_url);
//
// (async() => {
//     try {
//         var FabKSinvoke = require('../../fabcar/FabKSinvoke');
//         fc = new FabKSinvoke();
//         await fc.connect(baseconn, username); //args[1]第2个参数可选，一个用户名
//         console.log(typeof fc);
//         // req.session.Fab = fc;
//     } catch (err) {
//         console.error("连接出错", err);
//     }
// })();

module.exports.FConnect = FConnect;