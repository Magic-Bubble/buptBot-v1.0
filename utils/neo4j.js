var conf = require("../conf/neo4j");
var request = require('request');
var helper = require('../utils/helper');

function getEntity (entity, relationships, sendback) {
    if (relationships.length) {
        var list = helper.getList(relationships);
        (function fn(cur) {
            if (cur < list.length)
                get_er(entity, list[cur], function (data) {
                    if (!data.length) fn(cur+1);
                    else sendback(data, entity, list[cur]);
                });
            else sendback([]);
        })(0);
    } else {
        get_e(entity, sendback);
    }
}

function getNumber (entity, relationships, sendback) {
    if (relationships.length) get_er_n(entity, relationships[0], sendback);
    else sendback(relationships.length);
}

function get_er (entity, relationships, sendback) {
    var str = "MATCH (n)-[:";
    for (var i=0; i<relationships.length-1; i++) {
        str += relationships[i] + "]->()-[:";
    }
    str += relationships[i] + "]->(m) WHERE n.name = '" + entity + "' RETURN m";
    var sql = {
        "query": str
    }
    post(sql, function (body) {
        var data = extractEntity(body);
        sendback(data);
    })
}

function get_e (entity, sendback) {
    var sql = {
        "query": "MATCH (n) WHERE n.name = '" + entity + "' RETURN n"
    }
    post(sql, function (body) { 
        var data = extractEntity(body);
        sendback(data, entity); 
    });
}

function get_er_n (entity, relationship, sendback) {
    var sql = {
        "query": "MATCH (n)-[*0..]->()-[:" + relationship +"]->(m) WHERE n.name = '" + entity + "' RETURN m"
    }
    post(sql, function (body) { 
        var data = extractEntity(body);
        sendback(data); 
    });
}

function post (sql, callback) {
    request({
        url: conf.url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: sql
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        }
    });  
}

function extractEntity (body) {
    if (body.data.length) {
        var nodes = body.data, data = [];
        for (var i=0; i<nodes.length; i++) {
            data.push(nodes[i][0].data);
        }
        return data;
    }
    return [];
}

function extractNumber (body) {
    return body.data[0][0];
}

module.exports = {
	"getEntity": getEntity,
	"getNumber": getNumber
}