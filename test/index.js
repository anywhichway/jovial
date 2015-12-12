var Validator = require('../index.js');

var TestObject = function() {
	this.name = "Joe";
}
var TestObjectValidator = new Validator({name: {type:"string"}});
TestObject = TestObjectValidator.bind(TestObject,null,"TestObject");

var to1 = new TestObject();
try {
	to1.name = 1;
} catch(err) {
	console.log(JSON.stringify(err))
}
