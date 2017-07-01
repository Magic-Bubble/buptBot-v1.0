function createTextFromNode(node) {
	var text = "";
	text += '<h4>' + node['name'] + "</h4>";

	var sortedKeys = sortNodeKey(node);
	for (var i=0; i<sortedKeys.length; i++) {
		text += "<p>" + node[sortedKeys[i]] + "</p>";
	}

	return text;
}

function createHeroCardOptionsFromNode(node) {
	var options = {}
	options.title = node['name'];
	options.image = node['url'];

	var sortedKeys = sortNodeKey(node), text = "";
	for (var i=0; i<sortedKeys.length; i++) {
		if (sortedKeys[i] == 'desc_1') options.subtitle = node[sortedKeys[i]];
		else text += node[sortedKeys[i]] + " ";
	}
	options.text = text;

	return options;
}

function sortNodeKey(node) {
	var keys = [];

	var key_numbers = [];
	for (key in node)
		if (key.split("_")[1])
			key_numbers.push(parseInt(key.split("_")[1]));
	key_numbers.sort(ascOrder);

	var prefix = "desc_";
	for (var i=0; i<key_numbers.length; i++) {
		keys.push(prefix + key_numbers[i]);
	}

	return keys;
}

function ascOrder(x, y) {
	if (x > y) return 1;
	else return -1;
}

function getList (relationships) {
	var relationships = removeDup(relationships), res = [];
	for (var i=Math.pow(2, relationships.length)-1; i>0; i--) {
		var tmp = [];
		for (var j=0; j<relationships.length; j++)
			if (i>>j&1) 
				tmp.push(relationships[j]);
		tmp = permutation(tmp);
		for (var j=0; j<tmp.length; j++)
			res.push(tmp[j]);
		break;
	}
	return res;
}

function removeDup (arr) {
	var res = [];
	var obj = {};
	for (var i=0; i<arr.length; i++) {
		if (!obj[arr[i]]) {
			res.push(arr[i]);
			obj[arr[i]] = 1;
		}
	}
	return res;
}

function permutation (arr) {
	var res = [];
	var tmpArr = [];
	(function fn(cur) {
		if (cur == arr.length) res.push(tmpArr.concat());
		else {
			for (var i=0; i<arr.length; i++) {
				var ok = true;
				for (var j=0; j<cur; j++) if (arr[i] == tmpArr[j]) ok = false;
				if (ok) {
					tmpArr[cur] = arr[i];
					fn(cur+1);
				}
			}
		}
	})(0);
	return res;
}

function saveContext(session, entity, relationships) {
	if (!session.conversationData.context) session.conversationData.context = [];
	var context = {
		"entity": entity,
		"relationships": relationships
	};
	session.conversationData.context.push(context);
}

function saveQuestion(session) {
	if (!session.conversationData.allQuestions) session.conversationData.allQuestions = [];
	session.conversationData.allQuestions.push(session.message.text);
}

module.exports = {
	"createTextFromNode": createTextFromNode,
	"createHeroCardOptionsFromNode": createHeroCardOptionsFromNode,
	"getList": getList,
	"saveContext": saveContext,
	"saveQuestion": saveQuestion
}