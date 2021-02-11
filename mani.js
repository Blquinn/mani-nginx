// mani.js
// Author: Benjamin Quinn<benlquinn@gmail.com> 2021

function resolveAll(promises) {
    return new Promise((resolve, reject) => {
        var n = promises.length;
        var rs = Array(n);
        var done = () => {
            if (--n === 0) {
                resolve(rs);
            }
        };
        promises.forEach((p, i) => {
            p.then((x) => { rs[i] = x; }, reject).then(done);
        });
    });
}

// Validates the request body json.
// Returns an error string if any.
function validateRequest(request) {
    if (!request.requests) return 'Field requests is missing.';

    if (!Array.isArray(request.requests)) return 'requests must be an array.';

    for (var i = 0; i < request.requests.length; i++) {
        var r = request.requests[i];

        if (typeof(r.url) !== 'string') return 'Field url is missing.';
        if (typeof(r.method) !== 'string') return 'Field method is missing.';

        if (!r.headers) r.headers = [];

        if (!Array.isArray(r.headers)) {
            return 'Headers must be an array.'
        }

        for (var j = 0; j < r.headers.length; j++) {
            var h = r.headers[j];

            if (!Array.isArray(h) || h.length != 2 
                || typeof(h[0]) !== 'string' || typeof(h[1]) !== 'string') {
                return 'Header must be length 2 string array.';
            }
        }
    }

    return undefined;
}

function handleResponses(r, responses) {
    var mappedResponses = responses.map(res => {
        try {
            var ct = res.headersIn['Content-Type'];

            var isJson = ct && ct.startsWith('application/json');

            var body = null;
            if (isJson && res.responseText.length > 0) {
                body = JSON.parse(res.responseText);
            } else if (res.responseBody.length > 0) {
                body = res.responseBody.toString('base64');
            }

            return {
                response: {
                    statusCode: res.status,
                    headers: res.headersIn,
                    body,
                }
            }
        } catch(e) {
            return {
                error: {
                    description: e.toString(),
                }
            }
        }
    });

    var responseWrapper = {responses: mappedResponses};

    r.headersOut['Content-Type'] = 'application/json; encoding=utf-8';
    r.return(200, JSON.stringify(responseWrapper));
}

function mani(r) {
    var body;
    try {
        body = JSON.parse(r.requestText);
    } catch(e) {
        var msg = 'Failed to parse request json: ' + e;
        r.error(msg);
        r.return(400, msg)
    }

    var validationError = validateRequest(body);
    if (validationError) {
        r.return(400, validationError);
    }

    // TODO: Custom headers.
    var requests = body.requests.map(req => {
        var body = typeof(req.body) === 'string' 
            ? Buffer.from(req.body, 'base64') // If string, assume base64 encoded.
            : JSON.stringify(req.body); // If other type, assume json.

        // Is this query string parsing logic safe?
        var parts = req.url.split('?');
        var url = parts[0]
        var query = parts.length > 1 ? parts[1] : '';

        return r.subrequest(url, { args: query, method: req.method, body: body, detached: false });
    })

    resolveAll(requests)
        .then(responses => handleResponses(r, responses))
        .catch(err => {
            r.error(err);
            r.return(500, err)
        });
}
