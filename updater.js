var contentPath = 'content.js'; 
var manifestPath = 'manifest.json';
var commonUrlPart = 'https://raw.githubusercontent.com/naimanton/sibz-helper/main/';
var visualSplitter = ('-').repeat(79);
var n = '\n';
var bigTextWrap = (n).repeat(8);
var successMessageText = 'Обновление завершено. Перезапустите бразуер или перезапустите расширение в меню расширений в бразуере.';
var successMessage = bigTextWrap + visualSplitter + n + successMessageText + n + visualSplitter + bigTextWrap;
var fs = require('fs'); 
var https = require('https');
var contentText, manifestText;
function getGithubRawContent(url, callback) {
	https.get(url, function (res) {
		var data = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) { data += chunk; });
		res.on('end', function () { callback(data); });
	});
}
getGithubRawContent(commonUrlPart + manifestPath, function (mData) {
	manifestText = mData;
	getGithubRawContent(commonUrlPart + contentPath, function (cData) {
		contentText = cData;
		fs.writeFileSync(__dirname + '/content.js', contentText);
		fs.writeFileSync(__dirname + '/manifest.json', manifestText);
	});
	console.log(successMessage);
});
