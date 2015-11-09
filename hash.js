/**
 * Generates a sha1-hash
 */
"use strict";

var
	crypto = require('crypto'),
	extend = require('x-common').extend;

var secret= '1f5a9f1b7f471b2b3d800841c6eedf1A';

var M;
module.exports = extend( M = function(/* values */) {
	
	// generic content from all arguments
	var values=Array.prototype.slice.call(arguments);
	var shasum1 = crypto.createHash('sha1');
	
	shasum1.update( '' + secret );
	for(var i=0,l=values.length;i<l;i++) if(void 0!==values[i]) shasum1.update( '' + values[i] );
	
	// double hash against recalc with well known secrets, msisdn and urls
	var shasum2 = crypto.createHash('sha1');
	shasum2.update( secret + shasum1.digest('hex') );
	
	return shasum2;
},{
	string: function(values) {
		return M.apply(this, arguments).digest('hex');
	}
});
