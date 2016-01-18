var expect, Validator;
if(typeof(window)==="undefined") {
	expect = require("chai").expect;
	Validator = require('../index.js');
}


function TestObject() {
	this.stringProperty = "a";
	this.numberProperty = 1;
	this.booleanProperty = true;
	this.objectProperty = {};
	this.arrayProperty = [];
}
var Anonymous = function() {
	
}
describe('Validator ', function() {
  var name = TestObject.name;
  it('should use provided error handler if there is one ', function(done) {
	  	var constraint = {};
		constraint.stringProperty = {type: "string"};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,function(err) { done(); });
		var instance = new constructor();
		instance.stringProperty = undefined;
	  });
  it('should have __kind__ with same name as constructor if not specified, i.e. ' + name, function() {
	var validator = new Validator();
	var constructor = validator.bind(TestObject);
	var result = new constructor();
	expect(result.__kind__).to.be.equal(name);
  });
  if(typeof(window)==="object") {
	  it('should throw TypeError if required property is deleted ', function() {
			 var constraint = {stringProperty: {required: true}};
			 var validator = new Validator(constraint);
			 var constructor = validator.bind(TestObject,null,"TestObject");
			 var instance = new constructor();
			var result;
			try {
				delete instance.stringProperty;
			} catch(err) {
				result = err;
			}
			expect(result).to.be.an.instanceOf(Error);
			expect(result.errors.stringProperty.validation.required.error).to.be.an.instanceOf(TypeError);
		 });
   }
   it('should transform values ', function() {
		 var constraint = {stringProperty: {transform: function(v) { return v+"b"; }}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		 instance.stringProperty = "a";
		 expect(instance.stringProperty).to.equal("ab");
	 });
  describe('type ', function () {
	  var to = new TestObject();
	  to.stringProperty = "b";
	  to.numberProperty = 2;
	  to.booleanProperty = false;
	  to.objectProperty = {nested:true};
	  to.arrayProperty = [0,1];
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
		it('should succeed if value is a ' + typeof(to[property]), function () {
			instance[property] = to[property];
			expect(instance[property]).to.equal(to[property]);
		});
	  });
  });
  describe('ranges',function() {
	 it('should throw RangeError if string value set is not in range ', function() {
		 var constraint = {stringProperty: {between: ["a","c"]}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.stringProperty = "d";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.stringProperty.validation.between.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is not in range ', function() {
		 var constraint = {numberProperty:{between: [0,2]}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.numberProperty = 3;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.numberProperty.validation.between.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is less than min ', function() {
		 var constraint = {numberProperty: {min: 4}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.numberProperty = 3;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.numberProperty.validation.min.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is greater than max ', function() {
		 var constraint = {numberProperty: {max: 4}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.numberProperty = 5;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.numberProperty.validation.max.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if string length is not correct ', function() {
		 var constraint = {stringProperty: {length: 1}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.stringProperty = "aa";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.stringProperty.validation.length.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if Array length is not correct ', function() {
		 var constraint = {arrayProperty: {length: 1}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.arrayProperty = [0,1];
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.arrayProperty.validation.length.error).to.be.an.instanceOf(RangeError);
	 });
  });
  
});