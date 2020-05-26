/*
    Converted to front end code with browserify
*/


var elliptic = require('elliptic');
var util = require('util');
const { KEYUTIL } = require('jsrsasign');


function _preventMalleability(sig) {
	const halfOrder = elliptic.curves.p256.n.shrn(1);
	if (sig.s.cmp(halfOrder) === 1) {
		const bigNum = elliptic.curves.p256.n;
		sig.s = bigNum.sub(sig.s);
	}
	return sig;
}


window.signTransaction = function(digest, priv){

    const { prvKeyHex } = KEYUTIL.getKey(priv);

	const EC = elliptic.ec;
	
	const ecdsaCurve = elliptic.curves['p256'];
	const ecdsa = new EC(ecdsaCurve);
	const signKey = ecdsa.keyFromPrivate(prvKeyHex, 'hex');
	var sig = ecdsa.sign(Buffer.from(digest, 'hex'), signKey);
	
	sig = _preventMalleability(sig);
	
    const signature = Buffer.from(sig.toDER());
    
    return signature;
}

const { prvKeyHex } = KEYUTIL.getKey(priv);

const EC = elliptic.ec;

const ecdsaCurve = elliptic.curves['p256']
const ecdsa = new EC(ecdsaCurve);
const signKey = ecdsa.keyFromPrivate(prvKeyHex, 'hex')
var transactionBytes = commitProposal.toBuffer();