"use strict";
// call with ./util/node_modules/vows/bin/vows util/test/*.test.js

var vows = require('vows'),
	assert = require('assert'),
	token = require('../token'),
	suite = vows.describe('token');

suite.addBatch({
	'timestamp': {
		topic : token,
		'now not 0'           :function(token){ assert(token.timestamp()>0); },
		'now == period 0'     :function(token){ assert.strictEqual(token.timestamp(),token.timestamp(0)); },
		'now-previous == span':function(token){ assert.strictEqual((token.timestamp() -token.timestamp(-1)),token.span); },
		'next-now == span'    :function(token){ assert.strictEqual((token.timestamp(1)-token.timestamp()  ),token.span); }
	},
	'generate' : {
		topic : token,
		'length >= 10'    : function(token){ assert(token.generate().length >=10 );},
		'now == now'      : function(token){ assert.strictEqual(token.generate(),token.generate() );},
		'now != previous' : function(token){ assert.notEqual(token.generate(-1),token.generate() );},
		'now != next'     : function(token){ assert.notEqual(token.generate()  ,token.generate(1));},
		'now != next 491792412158 /a/url/foo/bar'     : function(token){ assert.notEqual(token.generate(   '491792412158','/a/url/foo/bar'),token.generate(1,'491792412158','/a/url/foo/bar'));},
		'now != previous 491792412158 /a/url/foo/bar' : function(token){ assert.notEqual(token.generate(-1,'491792412158','/a/url/foo/bar'),token.generate(  '491792412158','/a/url/foo/bar'));}
	},
	'validate': {
		topic : token,
		'current generated token is valid': function (token) {
			assert(token.validate(token.generate('491792412158','/a/url/foo/bar'),'491792412158','/a/url/foo/bar'));
		},
		'previous token no on edge case':{
			topic: function F(token) {
				// prevent edge case where we are exactly on a time span limit this tests then the generate and validate could
				// could happen suche that -1 would be infact -2, and therefore the test would have to fail.
				var now =+Date();
				if( ( now - Math.floor( now / token.span ) * token.span ) < 100 ) setTimeout(100,F);
				else this.callback(token);
			},
			'is valid':function(token){
				assert.strictEqual(token.validate(token.generate(-1,'491792412158','/a/url/foo/bar'),'491792412158','/a/url/foo/bar'),true);
			}
		},
		'pre previous is invalid': function (token) {
			assert.strictEqual(token.validate(token.generate(-2,'491792412158','/a/url/foo/bar'),'491792412158','/a/url/foo/bar'),false);
		},
		'future is invalid': function (token) {
			assert.strictEqual(token.validate(token.generate(1,'491792412158','/a/url/foo/bar'),'491792412158','/a/url/foo/bar'),false);
		}
	},
	'url': {
		topic: '/a/url/foo/bar',
		'token added to url and retrieved from url returns token': function (url) {
			var t=token.generate();
			var ut=token.url(url,t);
			assert.equal(token.url(ut),t);
		},
		'token added to url and retrieved from url with parameter returns token': function (url) {
			url+='?a=b&c=d';
			var t=token.generate();
			var ut=token.url(url,t)
			assert.equal(token.url(ut),t);
		}
	}
}).export(module,{error:false});
