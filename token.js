/**
 * Generates and validates a sha1-hash
 */
"use strict";

var
	crypto = require('crypto'),
	url    = require('url'),
	hash   = require('./hash'),
	x      = require('x-common').extend;

var secret= '1f5a9f1b7f471b2b3d800841c6eedf1A'; // hard-coded md5

var M;module.exports=x(M={},{
	
	span: 2*60*60*1000, // 2h (with 2h we have a 4h time span where a valid request can happen; see validate() for previous-param)
	
	/**
	 * Generates a span alligned time span for the given period , 0 is now, period -1 the previous one back in time
	 */
	timestamp: function(period/*optional*/ ){ period = period || 0;
		
		var time = +new Date(), span = M.span // millisecs
		
		time = time + (period * span);
		
		return Math.floor(time / span ) * span;
	},
	
	generate: function( period/*optional*/, msisdn, url /*etc. ...*/  ){
		
		// generic content from all arguments
		var content=Array.prototype.slice.call(arguments);
		
		// period is defined iff first argument is a number, 0 otherwise
		if( typeof period == 'number') content.shift(); else period = 0; 
		
		var timestamp = M.timestamp(period);
		content = [ timestamp, secret ].concat(content);
		
		return hash.string.apply(null, content);
	},
	
	/**
	 * A token is valid if its equal to a token generated of the same or previous time span 
	 */
	validate: function(token, msisdn, url /*etc. ...*/) {
		var content=Array.prototype.slice.call(arguments);
		content.shift();// remove token
		var
			token_generated_current_period = M.generate.apply(M,[0].concat(content)),
			token_generated_prev_period    = M.generate.apply(M,[-1].concat(content));
		
		return token && ( token === token_generated_current_period || token === token_generated_prev_period );
	},
	
	/** 
	 * Defines how a token is added to or retrieved from an url
	 */
	url: function(u/*url*/, token) { var parsed=false;
		if(typeof u =='string'){ u=url.parse(u,true); parsed=true; }
		if( token ){ // add token paramter
			delete u.search;
			u.query.token=token;
			return parsed?url.format(u):u; // return same format as called
		} else { // return parameter
			return u.query.token;
		}
	}
});
