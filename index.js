//     jovial
//
//     Copyright (c) 2015, 2016 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
	"use strict";
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
	var ProxyConstructor;
	function Validator(config) {
		var me = this;
		if(config) {
			var keys = Object.keys(config);
			keys.forEach(function(key) {
				me[key] = config[key];
				me[key].name = key;
			});
		}
	}
	if(typeof(Proxy)==="undefined"  && typeof(require)==="function") {
		var ProxyConstructor = require('chrome-proxy');
		if(this!==window) {
			Proxy = Constructor;
		}
	}
	Validator.prototype.bind = function(constructorOrObject,onerror,name) {
		function validate(target,property,value,proxy,skipset,skiponerror,error) { 
			var validation = validator[property], keys, error;
			if(validation) {
				keys = Object.keys(validation);
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
				keys.forEach(function(key) {
					if(typeof(Validator.validation[key])==="function" && key!=="transform") {
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
			},
			defineProperty: function(target, property, descriptor, proxy) {
				if(handler.set(target, property, descriptor.value, proxy, true)) {
					Object.defineProperty(target, property, descriptor);
				}
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
			constructorOrObject.validate = validateInstance;
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
			return (value && (value.length>=min && value.length<=max) || (value.count>=min && value.count<=max));
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
		var tel = {
				us: /^[01]?[- .]?\(?[2-9]\d{2}\)?[- .]?\d{3}[- .]?\d{4}$/
		};
		if(typeof(value)===type) {
			return true;
		}
		if(typeof(type)==="function") {
			return value instanceof type;
		}
		if(type==="SSN") {
			return /^\d{3}-\d{2}-\d{4}$/.test(value);
		}
		if(type==="latlon") {
			// David Jacobs via http://www.regexlib.com/
			return /(-?(90[ :°d]*00[ :\'\'m]*00(\.0+)?|[0-8][0-9][ :°d]*[0-5][0-9][ :\'\'m]*[0-5][0-9](\.\d+)?)[ :\?\"s]*(N|n|S|s)?)[ ,]*(-?(180[ :°d]*00[ :\'\'m]*00(\.0+)?|(1[0-7][0-9]|0[0-9][0-9])[ :°d]*[0-5][0-9][ :\'\'m]*[0-5][0-9](\.\d+)?)[ :\?\"s]*(E|e|W|w)?)/.test(value);
		}
		if(type.indexOf("tel")===0) {
			var split = type.split(".");
			split.shift();
			if(split.length===0) {
				split.push("us");
			}
			return split.some(function(country) {
				if(tel[country]) {
					return tel[country].test(value);
				}
			});
		}
		return false;
	}
	Validator.validation.type.onError = TypeError;
	
	if (this.exports) {
		this.exports  = Validator;
	} else if (typeof define === 'function' && define.amd) {
		// Publish as AMD module
		define(function() {return Proxy;});
	} else {
		this.Validator = Validator;
	}
}).call((typeof(window)!=='undefined' ? window : (typeof(module)!=='undefined' ? module : null)));