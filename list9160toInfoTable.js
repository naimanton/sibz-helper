var t = '\t', n = '\n'
var result = ``;
var regex = /[\a\b\f\n\r\t\v]/gi;
// var products = list9160 object result here
for (var pos of products) {
    var line = '';
    line += pos.code + t;
    var nameRes = pos.fullName;
    if (pos.options.length>0) {
        nameRes += ' (';
        nameRes += (pos.options.map(item => item.value)).join('; ')
        nameRes += ')'
    }
    line += nameRes + t;
    line += removeTags(pos.composition).replace(regex, ' ')+t;
    line += removeTags(pos.description).replace(regex, ' ')+t;
    line += removeTags(pos.useWay).replace(regex, ' ')+t;
    line += "https://kz.siberianwellness.com" + pos.url;
    result += line + n;
}
console.log(result)
