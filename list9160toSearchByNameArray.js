var result = []
var products = catres
for (var pos of products) {
    var array = [];
    var attr;
    if (pos.options.length === 0) {
        attr = ''
    }
    else {
        var values = pos.options.map(item => item.value);
        
        attr = ' (';
        attr += values.join('; ');
        attr += ')'
    }
    array[0] = pos.fullName + attr;
    array[1] = pos.code;

    result.push(array);
}
