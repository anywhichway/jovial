# JOVIAL
JavaScript Object Validation Interception Augmentation Library.

[![Build Status](https://travis-ci.org/anywhichway/jovial.svg)](https://travis-ci.org/anywhichway/jovial)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/42cd44eee8794c22aa7a4f780abd2d0b)](https://www.codacy.com/app/syblackwell/jovial)
[![Code Climate](https://codeclimate.com/github/anywhichway/jovial/badges/gpa.svg)](https://codeclimate.com/github/anywhichway/jovial)
[![Test Coverage](https://codeclimate.com/github/anywhichway/jovial/badges/coverage.svg)](https://codeclimate.com/github/anywhichway/jovial/coverage)
[![Issue Count](https://codeclimate.com/github/anywhichway/jovial/badges/issue_count.svg)](https://codeclimate.com/github/anywhichway/jovial)


[![NPM](https://nodei.co/npm/jovial.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jovial/)


A light weight, easily extensible validation mechanism for JavaScript objects that supports both batch and real-time per property validation. 

You can see an intro to JOVIAL at http://anywhichway.github.io/.

Here is an example Validator:

```
new Validator({name: {type: 'string', length: 25, required: true}, 
                  age: {type: 'number', min:0, max: 110},
                  gender: {in: ['male','female']},
                  ssn: {type: 'SSN'},
                  location: {type: 'latlon'}})
```
                
Also supported are RegExp matching, soundex testing, range testing, developer supplied functions.

# Install

npm install jovial

The index.js and package.json files are compatible with https://github.com/anywhichway/node-require so that jovial can be served directly to the browser from the node-modules/jovial directory when using node Express.

Browser code can also be found in the browser directory at https://github.com/anywhichway/jovial.

# Documentation

See the GitHub Wiki: https://github.com/anywhichway/jovial/wiki/

# Building & Testing

Building & testing is conducted using Travis, Mocha, Chai, and Istanbul.

# Notes

Due to an unavoidable shortcoming in chrome-proxy, the unit test for testing the prevention of deleting required properties fails. All tests should pass in Edge and Firefox.

# Updates (reverse chronological order)

2016-03-03-04 v0.0.25 internals complexity reduction and README update, no functional changes

2016-03-03-04 v0.0.24 credit card validation modified from RegExp to Luhn algorithm, ability to enhance types using functions added.

2016-02-04 v0.0.23  ISBN, credit card (CC), IP address (IP). Moved most documentatin to GitHUb wiki (https://github.com/anywhichway/jovial/wiki) so it will be easier to upgrade without pushing new NPM packages.

2016-01-28 v0.0.22 Added default values and write once support. Fixed bug with dot notation in subtypes (they did not work). Added the unit test!

2016-01-27 v0.0.21 Added email validation and made type checking extensible.

2016-01-23 v0.0.20 Attempting to fix Markdown issues on npmjs.org that do not manifest on GitHub. No code changes. Sure wish there was a way to push a new README to npmjs.org without a version increment!

2016-01-23 v0.0.19 Corrected length check on Set when value is actually unknown. Clarified the meaning of *unknown* in the documentation.

2016-01-23 v0.0.18 Modified type checking to ignore unknown values.

2016-01-23 v0.0.17 Addressed issue where Proxy sometimes did not get loaded and lifted to global scope by Browserify.

2016-01-23 v0.0.16 Cleaned-up Proxy bundling for Chrome. Corrected documentation regarding structure of ValidationError. Add non-null test for length validation.

2016-01-22 v0.0.15 Added *.echoes*, *.satisfies* and *.validate* and latlon type. Corrected bug where *.type* did not work as documented with functions. Added more unit tests. Updated documentation.

2016-01-21 v0.0.14 Updated dependency on chrome-proxy to > 0.0.8. 

2016-01-21 v0.0.13 Reworked module closure wrapper so it would work regardless of whether *browserify* is used. 

2016-01-18 v0.0.12 Corrected issue where underlying values did not get set after validation. Added more unit tests. Added *.length, .in, .transform*. Added support for property delete and define.

2016-01-13 v0.0.11 Added browserified and minified version.

2015-12-13 v0.0.10 Corrected README format

2015-12-13 v0.0.9 Added more unit tests and documentation

2015-12-13 v0.0.8 Added unit tests and missing error handlers for min, max, matches

2015-12-12 v0.0.7 Codacy driven improvements

2015-11-29 v0.0.6 Original public commit

# License

This software is provided as-is under the [MIT license](http://opensource.org/licenses/MIT).