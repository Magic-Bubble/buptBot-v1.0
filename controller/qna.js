require('dotenv-extended').load();
var request = require('request');
var noanswer = require('../conf/noanswer');

function getAnswer (question, sendback) {
    if (question != []) {
        var postdata = {
            "question": question[0]
        }
        post(postdata, function (body) {
            var body = body['answers'][0];
            if (body.score > 60) sendback(body.answer);
            else sendback("");
        });
    } else sendback("");
}

function post (data, callback) {
    request({
        url: process.env.QNA_MODEL_URL,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
            "Ocp-Apim-Subscription-Key": "11169cf40dfa415cb650ac9ad721b403"
        },
        body: data
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            callback("");
        }
    });  
}

module.exports = {
	"getAnswer": getAnswer
}