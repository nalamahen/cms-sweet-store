const expressValidator = require('express-validator');
var path = require('path');

module.exports = function(app) {
    // Express Validator middleware
    app.use(expressValidator({
        errorFormatter: function (param, msg, value) {
            var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

            while (namespace.length) {
                formParam += '[' + namespace.shift() + ']';
            }
            return {
                param: formParam,
                msg: msg,
                value: value
            };
        },
        customValidators: {
            isImage: function (value, filename) {
                var extension = (path.extname(filename)).toLowerCase();
                switch (extension) {
                    case '.jpg':
                        return '.jpg';
                    case '.jpeg':
                        return '.jpeg';
                    case '.png':
                        return '.png';
                    case '':
                        return '.jpg';
                    default:
                        return false;
                }
            }
        }
    }));
}