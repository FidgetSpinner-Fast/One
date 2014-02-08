var redis = require('redis'),
    client = redis.createClient();

var MAX_LENGTH = 3;
var domain = 'http://localhost:8000/'

client.on("error", function(err) {
    console.log(err);
})

exports.index = function(req, res){
  res.json({'status': 'success'});
};

exports.create_short = function(req, res) {
    var long_url = req.body.long_url;
    var id = make_id(); // generate an id
    client.get(id, function(err, reply) {
        // check if key exists
        if (err) {
            res.json({'status': 'failed', 'message': err});
        } else {
            console.log('in else');
            if (reply == null) {
                console.log('in if');
                // key does not exists
                client.mset([
                    id, long_url,
                    id+'-hits', "0",
                    id+'-created', new Date().getTime()
                    ], redis.print);
                console.log('values set');
                res.json({
                    'status': 'success', 
                    'short_id': id, 
                    'short_url': domain + id,
                    'long_url': long_url
                });
            } else {
                create_short();
            }
        }
    });
}

exports.find_redirect = function(req, res) {
    var id = req.slug;
    client.get(id, function(err, reply) {
        if (err) {
            res.json({'status': 'failed', 'message': err});
        } else {
            if (reply == null) {
                // url has not been created
                res.json({'status': 'failed', 'message': 'id not found'});
            } else {
                console.log(reply);
            }
        }
    })
}

var make_id = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < MAX_LENGTH; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
