# JOVIAL
Javascript Object Validation Interception Augmentation Library.

A light weight, easily extensible validation mechanism for Javascript objects.

[![Build Status](https://travis-ci.org/anywhichway/jovial.svg)](https://travis-ci.org/anywhichway/jovial)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/42cd44eee8794c22aa7a4f780abd2d0b)](https://www.codacy.com/app/syblackwell/jovial)
[![Code Climate](https://codeclimate.com/github/anywhichway/jovial/badges/gpa.svg)](https://codeclimate.com/github/anywhichway/jovial)
[![Test Coverage](https://codeclimate.com/github/anywhichway/jovial/badges/coverage.svg)](https://codeclimate.com/github/anywhichway/jovial/coverage)
[![Issue Count](https://codeclimate.com/github/anywhichway/jovial/badges/issue_count.svg)](https://codeclimate.com/github/anywhichway/jovial)

[![NPM](https://nodei.co/npm/jovial.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/<jovial>/)

# Install

npm install jovial

The index.js and package.json files are compatible with https://github.com/anywhichway/node-require so that joex can be served directly to the browser from the node-modules/joex directory when using node Express.

Browser code can also be found in the browser directory at https://github.com/anywhichway/jovial.


# Usage

The core of JOVIAL is the Validator class. The constructor for Validator takes a configuration object consisting of properties with the same names as those to be validated on a target object. The property values for the configuration object control the validation of the same named properties on a target object. For example:

```{name : {type: 'string'}}``` will constrain 'name' to be a string.

Validators are bound to either constructors or object instances using the Validator instance method *.bind(constructorOrInstance,onError,name)*. If an *onError* callback is not provided, then attempts to set invalid property values on the bound object will throw errors. The *onError* callback takes one argument, the error that would otherwise have been thrown. The *name* argument is optional except in IE where the *.name* property is unavailable for Function objects. The names of bound constructors are used internal to the library for look-ups and must be available. The *.bind* method returns either a new instrumented constructor or a proxy for the bound object. The new instrumented constructor should be used in place of the original constructor. For example, the following will throw an error:

```
function Person() { }
var validator = new Validator({name: {type: 'string'}});
Person = validator.bind(Person);
var instance = new Person();
instance.name = 1;
```

There are plans to fully support both real-time per property validation and batch validation. Hence, the errors thrown by JOVIAL are actually containers for other errors and details regarding the causes:

```{object: {name:'Bill'},errors:{age: {value: -1, min: {constraint: 0, error: [RangeError]}}}}```

Currently JOVIAL supports:

*.type* - primitive Javascript type checking for "string" | "boolean" | "function" | "object" | "SSN" | "tel" | function. If a function is provided as a type, then the function is assumed to be a constructor and an *instanceof* check is done.

*.min*, *.max*, and *.between* = number | string

*.match* = RegExp

*.required* = true | false

*.in* = \<array instance\> for verifying membership in a restricted list

*.length* = number |  \<array instance\> for strings and arrays. If *.length is an array, then its min and a max are used for testing the min and max length of the target value

*.transform* = function to transform values prior to setting them on the underlying object, e.g. `{name: {transform: function(v) { return v+"";}}` The transformation occurs before any validation.

Soundex and echoes are in development:

If you would like others, then post an issue to GitHub with the code based on the extension instructions below.

# Extending JOVIAL

Extending JOVIAL is as simple as adding methods to the Validator class by the same name as the constraint desired on properties and providing an optional error type. For example, the constraints 'between' and 'min' and 'max' are implemented as:

```
Validator.validation.between = function(between,value) {
		between.sort(function(a,b) { return a - b; });
		var min = between[0];
		var max = between[between.length-1];
		return value>=min && value<=max;
}
Validator.validation.between.onError = RangeError;

Validator.validation.min = function(min,value) {
		return value>=min;
}
Validator.validation.min.onError = RangeError;

Validator.validation.max = function(max,value) {
		return value<=max;
}
Validator.validation.max.onError = RangeError;
```

Using the above, we can extend the Person example as follows:

```
function Person() { }
var validator = new Validator({name: {type: 'string'}, age:{min: 0, max: 110}}});
Person = validator.bind(Person);
var instance = new Person();
instance.age = 120; // throws a RangeError {object: {},errors:{age: {value: 120, max: {constraint: 110, error: [RangeError]}}}}
```

or

```
function Person() { }
var validator = new Validator({name: {type: 'string'}, age:{between: [0,110]}});
Person = validator.bind(Person);
var instance = new Person();
instance.age = 120; // throws a RangeError {object: {},errors:{age: {value: 120, between: {constraint: [0,110], error: [RangeError]}}}}
```


# Implementation

JOVIAL is implemented using a Proxy. As attempts are made to modify the properties of target objects at runtime the validation routines are called with the constraint established by the Validator and the new values being set by the application code. The validators are selected based on the names of constraint attributes. For example the following will throw an error because the method Validator.validation.min exists to match the Validator constraint:

```
function Person() { }
var validator = new Validator({name: {type: 'string'}, age: {type: 'number', min: 0}});
Person = validator.bind(Person);
var instance = new Person();
instance.age = -1;
```

For versions of Chrome not supporting a Proxy the browser code includes the shim https://github.com/anywhichway/chrome-proxy while the server code has a dependency and does a conditional require.

# Building & Testing

Building & testing is conducted using Travis, Mocha, Chai, and Istanbul. 

# Updates (reverse chronological order)`

2015-12-18 v0.0.12 Corrected issue where underlying values did not get set after validation. Added more unit tests. Added *.length, .in, .transform*. Added support for property delete and define.

2015-12-13 v0.0.11 Added browserified and minified version.

2015-12-13 v0.0.10 Corrected README format

2015-12-13 v0.0.9 Added more unit tests and documentation

2015-12-13 v0.0.8 Added unit tests and missing error handlers for min, max, matches

2015-12-12 v0.0.7 Codacy driven improvements

2015-11-29 v0.0.6 Original public commit

# License

This software is provided as-is under the [MIT license](http://opensource.org/licenses/MIT).