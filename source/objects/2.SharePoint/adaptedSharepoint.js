var SP = require('sharepoint');
var https = require('https');

SP.RestService.prototype.request = function(options, next) {
    var req_data = options.data || '',
        list = options.list,
        id = options.id,
        query = options.query,
        ssl = (this.protocol == 'https:'),
        path = this.path + this.odatasvc + list +
            (id ? '(' + id + ')' : '') +
            (query ? '?' + qs.stringify(query) : '');

    var req_options = {
        method: options.method,
        host: this.host,
        path: path,
        auth: this.username +":" + this.password2,
        headers: {
            'Accept': options.accept || 'application/json',
            'Content-type': 'application/json',
            'Cookie': 'FedAuth=' + this.FedAuth + '; rtFa=' + this.rtFa,
            'Content-length': req_data.length
        }
    };

    // Include If-Match header if etag is specified
    if (options.etag) {
        req_options.headers['If-Match'] = options.etag;
    };

    // support for using https
    var protocol = (ssl ? https : http);

    var req = protocol.get(req_options, function (res) {
        var res_data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('CHUNK:', chunk);
            res_data += chunk;
        });
        res.on('end', function () {
            // if no callback is defined, we're done.
            if (!next) return;

            // if data of content-type application/json is return, parse into JS:
            if (res_data && (res.headers['content-type'].indexOf('json') > 0)) {
                res_data = JSON.parse(res_data).d
            }

            if (res_data) {
                next(null, res_data)
            }
            else {
                next()
            }
        });
    })

    req.end(req_data);
}

module.exports=SP;