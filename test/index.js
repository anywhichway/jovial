var expect = require("chai").expect;
var Validator = require('../index.js');



function TestObject() {
	this.stringProperty = "a";
	this.numberProperty = 1;
	this.booleanProperty = true;
	this.objectProperty = {};
}
describe('Validator', function() {
  describe('type', function () {
	  var to = new TestObject();
	  var properties = Object.keys(to);
	  properties.forEach(function(property) {
		var constraint = {};
		constraint[property] = {type: typeof(to[property])};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		it('should throw TypeError if value set is not a ' + typeof(to[property]), function () {
			var result;
			try {
				instance[property] = undefined;
			} catch(err) {
				result = err;
			}
			expect(result).to.be.an.instanceOf(Error);
			expect(result.errors[property].validation.type.error).to.be.an.instanceOf(TypeError);
		});
	  });
  });
  describe('between',function() {
	 var constraint = {};
	 var range = ["a","c"];
	 var property = "stringProperty";
	 constraint[property] = {between: range};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 it('should throw RangeError if string value set is not in range: ' + JSON.stringify(range), function() {
		var result;
		try {
			instance[property] = "d";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors[property].validation.between.error).to.be.an.instanceOf(RangeError);
	 });
  	 constraint = {};
	 range = [0,2];
	 var property = "numberProperty";
	 constraint[property] = {between: range};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 it('should throw RangeError if number value set is not in range: ' + JSON.stringify(range), function() {
		var result;
		try {
			instance[property] = 3;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors[property].validation.between.error).to.be.an.instanceOf(RangeError);
	 });
  });
});