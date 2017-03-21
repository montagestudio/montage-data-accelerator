console.log('montage-testing', 'Start');
require("montage-testing").run(require, [
	"spec/http-service",
]).then(function () {
	console.log('montage-testing', 'End');
}, function (err) {
	console.log('montage-testing', 'Fail', err, err.stack);
});