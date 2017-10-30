'use strict';

var router = require('tiny-router');
var os = require('os');


router.addMimeType({ext:'.svg', mime:'image/svg+xml'});
router.addMimeType({ext:'.woff2', mime:'application/font-woff2; charset=UTF-8'});
router.addMimeType({ext:'.woff', mime:'application/font-woff'});
router.addMimeType({ext:'.ttf', mime:'application/x-font-ttf'});


router.use('static', {path: __dirname + '/dist'});
router.use(function(req, res, next){
    console.log('URL: ', req.url);
    next();
});

router.listen(3000);

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

console.log("Hamsa Admin live at http://"+addresses[0]+":3000/");
