//     jovial
//
//     Copyright (c) 2015, 2016 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
//     jovial
//
//     Copyright (c) 2015, 2016 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
	"use strict";
	// valid_credit_card from https://gist.github.com/DiegoSalazar/4075533#file-validate_credit_card-js
	function valid_credit_card(value) {
	  // accept only digits, dashes or spaces
		if (/[^0-9-\s]+/.test(value)) { return false; }

		// The Luhn Algorithm. It's so pretty.
		var nCheck = 0, nDigit = 0, bEven = false;
		value = value.replace(/\D/g, "");

		for (var n = value.length - 1; n >= 0; n--) {
			var cDigit = value.charAt(n);
			nDigit = parseInt(cDigit, 10);

			if (bEven) {
				if ((nDigit *= 2) > 9) { nDigit -= 9; }
			}

			nCheck += nDigit;
			bEven = !bEven;
		}

		return (nCheck % 10) === 0;
	}
	// soundex from https://gist.github.com/shawndumas/1262659
	function soundex(s) {
	    var a = s.toLowerCase().split(''),
	    f = a.shift(),
	    r = '',
	    codes = {
	        a: '', e: '', i: '', o: '', u: '',
	        b: 1, f: 1, p: 1, v: 1,
	        c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
	        d: 3, t: 3,
	        l: 4,
	        m: 5, n: 5,
	        r: 6
	    };
	
		r = f +
		    a
		    .map(function (v) { return codes[v] })
		    .filter(function (v, i, a) {
		        return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
		    })
		    .join('');
		
		return (r + '000').slice(0, 4).toUpperCase();
	}
	function Validator(config,limit) {
		var me = this;
		me.limit = limit;
		if(config) {
			var keys = Object.keys(config);
			keys.forEach(function(key) {
				me[key] = config[key];
				me[key].name = key;
			});
		}
	}
	Validator.prototype.bind = function(constructorOrObject,onerror,name) {
		function validate(target,property,value,proxy,skipset,skiponerror,error) { 
			var validation = validator[property], keys;
			if(validation) {
				keys = Object.keys(validation);
				value = (validation.default!==undefined && (value===undefined || value===null) ? validation.default : value);
				try {
					value = (validation.transform ? Validator.validation.transform(validation.transform,value) : value);
				} catch(e) {
					error = (error ? error : new Validator.ValidationError(target));
					error.errors[property] = (error.errors[property] ? error.errors[property] : {});
					error.errors[property].value = (value===undefined ? null : value);
					error.errors[property].validation = (error.errors[property].validation ? error.errors[property].validation : {});
					error.errors[property].validation.transform = {constraint: validation.transform};
					error.errors[property].validation.transform.error = e;
				}
				if(validation.writeonce && target[property]!==value && target[property]!==undefined) {
					error = (error ? error : new Validator.ValidationError(target));
					error.errors[property] = (error.errors[property] ? error.errors[property] : {});
					error.errors[property].value = (value===undefined ? null : value);
					error.errors[property].validation = (error.errors[property].validation ? error.errors[property].validation : {});
					error.errors[property].validation.writeonce = {constraint: validation.writeonce};
					var msg = property + ":" + (typeof(value)==="string" ? "\"" + value + "\"" : (value instanceof Object ? JSON.stringify(value) : value)) + " failed validation {\"writeonce\":" + JSON.stringify(error.errors[property].validation.writeonce) + "}";
					Validator.validation.type.onError = RangeError;
					var propertyerror = new (Validator.validation.writeonce.onError ? Validator.validation.writeonce.onError : Error)(msg);
					error.errors[property].validation.writeonce.error = propertyerror;
				}
				keys.forEach(function(key) {
					if(typeof(Validator.validation[key])==="function" && key!=="transform" && key!=="default" && (value!==undefined || key==="required")) {
						var result = Validator.validation[key](validation[key],value);
						if(!result) {
							error = (error ? error : new Validator.ValidationError(target));
							error.errors[property] = (error.errors[property] ? error.errors[property] : {});
							error.errors[property].value = (value===undefined ? null : value);
							error.errors[property].validation = (error.errors[property].validation ? error.errors[property].validation : {});
							error.errors[property].validation[key] = {constraint: validation[key]};
							var msg = property + ":" + (typeof(value)==="string" ? "\"" + value + "\"" : (value instanceof Object ? JSON.stringify(value) : value)) + " failed validation {\"" + key + "\":" + JSON.stringify(error.errors[property].validation[key]) + "}";
							Validator.validation.type.onError = TypeError;
							var propertyerror = new (Validator.validation[key].onError ? Validator.validation[key].onError : Error)(msg);
							error.errors[property].validation[key].error = propertyerror;
						}
					}
				});
			} else if(validator.limit) {
				error = new Error(property + " is not an allowed property for a " + target.constructor.name);
			}
			if(error) {
				if(!skiponerror && onerror) {
					onerror(error)
				} else {
					throw error;
				}
			} else  {
				if(!skipset) {
					target[property] = value;
				}
				return true;
			}
		}
		function validateInstance(trap) {
			var me = this, keys = Object.keys(me), error;
			keys.forEach(function(key) {
				var value = me[key];
				if(typeof(value)!=="function") {
					try {
						validate(me,key,value,undefined,true,true,error);
					} catch(e) {
						error = e;
					}
				}
			});
			if(trap) {
				return error;
			}
			if(onerror) {
				if(error) {
					onerror(error);
				}
			} else if(error) {
				throw error;
			}
		}
		name = (name ? name : (constructorOrObject.name ? constructorOrObject.name : "anonymous"));
		var validator = this, cons;
		var handler = {
			deleteProperty: function(target,property,proxy) {
				var validation = validator[property];
				if(Validator.validation.required(validation.required,undefined)) {
					delete target[property];
					return true;
				}
				handler.set(target,property,undefined,proxy,true);
				return true;
			},
			defineProperty: function(target, property, descriptor, proxy) {
				if(handler.set(target, property, descriptor.value, proxy, true)) {
					Object.defineProperty(target, property, descriptor);
				}
				return true;
			},
			set: validate
		};
		if(constructorOrObject instanceof Function) {
			cons = Function("cons","hndlr","prxy","return function " + name + "() { cons.apply(this,arguments); return new prxy(this,hndlr);  }")(constructorOrObject,handler,Proxy);
			cons.prototype = Object.create(constructorOrObject.prototype);
			cons.prototype.__kind__ = name;
			cons.prototype.constructor = cons;
			cons.prototype.validate = validateInstance;
			return cons;
		} else {
			Object.defineProperty(constructorOrObject,"validate",{enumerable:false,configurable:true,writable:true,value:validateInstance});
		}
		return new Proxy(constructorOrObject,handler);
	}
	Validator.ValidationError = function(object) {
		this.object = object;
		this.errors = {};
	}
	Validator.ValidationError.prototype = Object.create(Error.prototype);
	Validator.ValidationError.prototype.constructor = Validator.ValidationError;
	Validator.validation = {};
	
	Validator.validation.transform = function(f,value) {
		return f(value);
	}
	Validator.validation.transform.onError = TypeError;
	
	Validator.validation.writeonce = {};
	Validator.validation.writeonce.onError = RangeError;
	
	Validator.validation.default = {};
	Validator.validation.default.onError = RangeError
	
	Validator.validation.between = function(between,value) {
		between.sort(function(a,b) { return a - b; });
		var min = between[0];
		var max = between[between.length-1];
		return value>=min && value<=max;
	}
	Validator.validation.between.onError = RangeError;
	
	Validator.validation.echoes = function(echoes,value) {
		return soundex(echoes)===soundex(value);
	}
	Validator.validation.echoes.onError = RangeError;
	
	Validator.validation.in = function(values,value) {
		return values.indexOf(value)>=0;
	}
	Validator.validation.in.onError = RangeError;
	
	Validator.validation.length = function(length,value) {
		if(length instanceof Array) {
			length.sort(function(a,b) { return a - b; });
			var min = length[0];
			var max = length[length.length-1];
			return value && ((value.length>=min && value.length<=max) || (value.count>=min && value.count<=max));
		}
		return value && (value.length===length || value.count===length);
	}
	Validator.validation.length.onError = RangeError;
	
	Validator.validation.matches = function(regex,value) {
		return new RegExp(regex).test(value);
	}
	Validator.validation.matches.onError = RangeError;
	
	Validator.validation.max = function(max,value) {
		return value<=max;
	}
	Validator.validation.max.onError = RangeError;
	
	Validator.validation.min = function(min,value) {
		return value>=min;
	}
	Validator.validation.min.onError = RangeError;
	
	Validator.validation.required = function(required,value) {
		return (required ? value!==undefined : true);
	}
	Validator.validation.required.onError = TypeError;
	
	Validator.validation.satisfies = function(satisfies,value) {
		return satisfies(value);
	}
	Validator.validation.satisfies.onError = RangeError;
	
	Validator.validation.type = function(type,value) {
		if(value===undefined || typeof(value)===type) {
			return true;
		}
		if(typeof(type)==="function") {
			return value instanceof type;
		}
		if(Validator.type[type]) {
			if(typeof(Validator.type[type])==="function") {
				return Validator.type[type](value);
			} else if(typeof(Validator.type[type])==="object" && !(Validator.type[type] instanceof RegExp)) {
				return Validator.type[type].default.test(value);
			}
			return Validator.type[type].test(value);
		}
		if(type.indexOf(".")>=0) {
			var split = type.split(".");
			type = split.shift();
			return Validator.type[type] instanceof Object && split.some(function(subkey) {
				if(Validator.type[type][subkey]) {
					return Validator.type[type][subkey].test(value);
				}
			});
		}
		return false;
	}
	Validator.type = {
		//CC: /^3(?:[47]\d([ -]?)\d{4}(?:\1\d{4}){2}|0[0-5]\d{11}|[68]\d{12})$|^4(?:\d\d\d)?([ -]?)\d{4}(?:\2\d{4}){2}$|^6011([ -]?)\d{4}(?:\3\d{4}){2}$|^5[1-5]\d\d([ -]?)\d{4}(?:\4\d{4}){2}$|^2014\d{11}$|^2149\d{11}$|^2131\d{11}$|^1800\d{11}$|^3\d{15}$/, //http://regexlib.com, Conrorozo
		CC: valid_credit_card,
		email: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/,
		IP: /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/, //http://regexlib.com, Duthie
		ISBN: /(ISBN[-]*(1[03])*[ ]*(: ){0,1})*(([0-9Xx][- ]*){13}|([0-9Xx][- ]*){10})/, // http://regexlib.com/ Churk
		latlon: /(-?(90[ :°d]*00[ :\'\'m]*00(\.0+)?|[0-8][0-9][ :°d]*[0-5][0-9][ :\'\'m]*[0-5][0-9](\.\d+)?)[ :\?\"s]*(N|n|S|s)?)[ ,]*(-?(180[ :°d]*00[ :\'\'m]*00(\.0+)?|(1[0-7][0-9]|0[0-9][0-9])[ :°d]*[0-5][0-9][ :\'\'m]*[0-5][0-9](\.\d+)?)[ :\?\"s]*(E|e|W|w)?)/, //http://regexlib.com Jacobs
		SSN: /^\d{3}-\d{2}-\d{4}$/,
		tel: {
			default: /^[01]?[- .]?\(?[2-9]\d{2}\)?[- .]?\d{3}[- .]?\d{4}$/,
			us: /^[01]?[- .]?\(?[2-9]\d{2}\)?[- .]?\d{3}[- .]?\d{4}$/
		}
	}
	Validator.validation.type.onError = TypeError;
	if(typeof(window)!=="undefined") {
		window.Validator = Validator;
	}
	if (this.exports) {
		this.exports  = Validator;
	} else if (typeof define === "function" && define.amd) {
		// Publish as AMD module
		define(function() {return Validator;});
	} else {
		this.Validator = Validator;
	}
}).call((typeof(module)!=="undefined" ? module : (typeof(window)!=="undefined" ? window : null)));