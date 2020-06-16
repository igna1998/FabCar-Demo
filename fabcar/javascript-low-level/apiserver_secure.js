var express = require('express');
var bodyParser = require('body-parser');


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const cors = require('cors');
// Setting for Hyperledger Fabric
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'hyperledger-fabric-network-from-scratch', 'connection-org1.json');



const Fabric_Client = require('fabric-client');
const fs = require('fs');
const util = require('util');
const elliptic = require('elliptic');
const { KEYUTIL } = require('jsrsasign');




var network_path = path.resolve('..', '..', 'hyperledger-fabric-network-from-scratch');
var org1tlscacert_path = path.resolve(network_path, 'crypto-config', 'peerOrganizations', 'factory.workspace', 'tlsca', 'tlsca.factory.workspace-cert.pem');
var org1tlscacert = fs.readFileSync(org1tlscacert_path, 'utf8');

var org2tlscacert_path = path.resolve(network_path, 'crypto-config', 'peerOrganizations', 'delivery.workspace', 'tlsca', 'tlsca.delivery.workspace-cert.pem');
var org2tlscacert = fs.readFileSync(org2tlscacert_path, 'utf8');

var org3tlscacert_path = path.resolve(network_path, 'crypto-config', 'peerOrganizations', 'sales-point1.workspace', 'tlsca', 'tlsca.sales-point1.workspace-cert.pem');
var org3tlscacert = fs.readFileSync(org3tlscacert_path, 'utf8');

var org4tlscacert_path = path.resolve(network_path, 'crypto-config', 'peerOrganizations', 'sales-point2.workspace', 'tlsca', 'tlsca.sales-point2.workspace-cert.pem');
var org4tlscacert = fs.readFileSync(org4tlscacert_path, 'utf8');

//change this for every user
const privateKeyPath = path.resolve(__dirname, './hfc-key-store/privkey.pem');
const priv = fs.readFileSync(privateKeyPath, 'utf8');
const userPath = path.resolve(__dirname, './hfc-key-store/user3');
const cert = JSON.parse(fs.readFileSync(userPath, 'utf8')).enrollment.identity.certificate;
const mspId = "Org1MSP";



function _preventMalleability(sig) {
	const halfOrder = elliptic.curves.p256.n.shrn(1);
	if (sig.s.cmp(halfOrder) === 1) {
		const bigNum = elliptic.curves.p256.n;
		sig.s = bigNum.sub(sig.s);
	}
	return sig;
}



var allowedOrigins = ['http://localhost:3000',
                      'http://yourapp.com'];

app.use(cors({
  origin: function(origin, callback){    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }    return callback(null, true);
  }
}));



app.get('/api/queryallcars', async function (req, res) {
	// setup the fabric network
	const fabric_client = new Fabric_Client();
	var channel = fabric_client.newChannel('workspace');
	var peer = fabric_client.newPeer('grpcs://localhost:7051', {
		'ssl-target-name-override': 'peer1.factory.workspace',
		pem: org1tlscacert
	});
	channel.addPeer(peer);

	//
	var store_path = path.join(__dirname, 'hfc-key-store');
	console.log('Store path:'+store_path);

	// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
	Fabric_Client.newDefaultKeyValueStore({ path: store_path
	}).then((state_store) => {
		// assign the store to the fabric client
		fabric_client.setStateStore(state_store);
		var crypto_suite = Fabric_Client.newCryptoSuite();
		// use the same location for the state store (where the users' certificate are kept)
		// and the crypto store (where the users' keys are kept)
		var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		crypto_suite.setCryptoKeyStore(crypto_store);
		fabric_client.setCryptoSuite(crypto_suite);

		// get the enrolled user from persistence, this user will sign all requests
		return fabric_client.getUserContext('user3', true);
	}).then((user_from_store) => {
		if (user_from_store && user_from_store.isEnrolled()) {
			console.log('Successfully loaded user3 from persistence');
		} else {
			throw new Error('Failed to get user3.... run registerUser.js');
		}

		// queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
		// queryAllCars chaincode function - requires no arguments , ex: args: [''],
		const request = {
			//targets : --- letting this default to the peers assigned to the channel
			chaincodeId: 'mycc',
			fcn: 'queryAllCars',
			args: ['']
		};

		// send the query proposal to the peer
		return channel.queryByChaincode(request);

	}).then((query_responses) => {
		console.log("Query has completed, checking results");
		// query_responses could have more than one  results if there multiple peers were used as targets
		if (query_responses && query_responses.length == 1) {
			if (query_responses[0] instanceof Error) {
				console.error("error from query = ", query_responses[0]);
			} else {
				var result = query_responses[0];
				console.log("Response is ", result.toString());
				res.status(200).json({response: result.toString()});
			}
		} else {
			console.log("No payloads were returned from query");
		}
	}).catch((err) => {
		console.error('Failed to query successfully :: ' + err);
	});

});

/*
app.get('/api/query/:car_index', async function (req, res) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('workspace');

        // Get the contract from the network.
        const contract = network.getContract('mycc');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryCar', req.params.car_index);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json({response: result.toString()});

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});
*/

const fabric_client2 = new Fabric_Client();

// setup the fabric network
// -- channel instance to represent the ledger named "mychannel"
const channel2 = fabric_client2.newChannel('workspace');
console.log('Created client side object to represent the channel');
// -- peer instance to represent a peer on the channel
var peer1 = fabric_client2.newPeer('grpcs://localhost:7051', {
	'ssl-target-name-override': 'peer1.factory.workspace',
	pem: org1tlscacert
});
var peer2 = fabric_client2.newPeer('grpcs://localhost:9051', {
	'ssl-target-name-override': 'peer1.delivery.workspace',
	pem: org2tlscacert
});
var peer3 = fabric_client2.newPeer('grpcs://localhost:11051', {
	'ssl-target-name-override': 'peer1.sales-point1.workspace',
	pem: org3tlscacert
});
var peer4 = fabric_client2.newPeer('grpcs://localhost:13051', {
	'ssl-target-name-override': 'peer1.sales-point2.workspace',
	pem: org4tlscacert
});

channel2.addPeer(peer1);
channel2.addPeer(peer2);
channel2.addPeer(peer3);
channel2.addPeer(peer4);



/*
app.post('/api/addcar/', async function (req, res) {
	try {

		console.log('Created client side object to represent the peer')
		// This sample application uses a file based key value stores to hold
		// the user information and credentials. These are the same stores as used
		// by the 'registerUser.js' sample code
		const store_path = path.join(__dirname, 'hfc-key-store');
		console.log('Setting up the user store at path:'+store_path);
		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		const state_store = await Fabric_Client.newDefaultKeyValueStore({ path: store_path});
		// assign the store to the fabric client
		fabric_client2.setStateStore(state_store);
		const crypto_suite = Fabric_Client.newCryptoSuite();
		// use the same location for the state store (where the users' certificate are kept)
		// and the crypto store (where the users' keys are kept)
		const crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		crypto_suite.setCryptoKeyStore(crypto_store);
		fabric_client2.setCryptoSuite(crypto_suite);
		console.log('Setting up client side network objects');
		// fabric client instance
		// starting point for all interactions with the fabric network
		

		// get the enrolled user from persistence and assign to the client instance
		//    this user will sign all requests for the fabric network
		const user = await fabric_client2.getUserContext('user3', true);
		if (user && user.isEnrolled()) {
			console.log('Successfully loaded "user3" from user store');
		} else {
			throw new Error('\n\nFailed to get user3.... run registerUser.js');
		}

		console.log('Successfully setup client side');
		console.log('\n\nStart invoke processing');

		// Use service discovery to initialize the channel
		await channel2.initialize({ discover: true, asLocalhost: true });
		console.log('Used service discovery to initialize the channel');

		// get a transaction id object based on the current user assigned to fabric client
		// Transaction ID objects contain more then just a transaction ID, also includes
		// a nonce value and if built from the client's admin user.
		const tx_id = fabric_client2.newTransactionID();
		console.log(util.format("\nCreated a transaction ID: %s", tx_id.getTransactionID()));

		// The fabcar chaincode is able to perform a few functions
		//   'createCar' - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom']
		//   'changeCarOwner' - requires 2 args , ex: args: ['CAR10', 'Dave']
		const proposal_request = {
			targets: [peer1, peer2, peer3, peer4],
			chaincodeId: 'mycc',
			fcn: 'createCar',
			args: [req.body.carid, req.body.make, req.body.model, req.body.colour, req.body.owner],
			chainId: 'workspace',
			txId: tx_id
		};


		const { proposal, txId } = channel2.generateUnsignedProposal(proposal_request, mspId, cert);

		const proposalBytes = proposal.toBuffer();
		const digest = fabric_client2.getCryptoSuite().hash(proposalBytes);


		//this has to be done in the client
		//////////////////
		const { prvKeyHex } = KEYUTIL.getKey(priv);

		const EC = elliptic.ec;
		
		const ecdsaCurve = elliptic.curves['p256'];

		const ecdsa = new EC(ecdsaCurve);
		const signKey = ecdsa.keyFromPrivate(prvKeyHex, 'hex');
		var sig = ecdsa.sign(Buffer.from(digest, 'hex'), signKey);
		
		sig = _preventMalleability(sig);
		
		const signature = Buffer.from(sig.toDER());

		/////////////////
		const signedProposal = {
		    signature,
		    proposal_bytes: proposalBytes,
		};

		var sendSignedProposalReq = {
			signedProposal: signedProposal,
			targets: [peer1, peer2, peer3, peer4]
		}		
		const proposalResponses = await channel2.sendSignedProposal(sendSignedProposalReq);

		const commitReq = {
			proposalResponses,
			proposal,
		};
		
		const commitProposal = await channel2.generateUnsignedTransaction(commitReq);

		//const signedCommitProposal = signProposal(commitProposal);

		var transactionBytes = commitProposal.toBuffer();
    	var transaction_digest = fabric_client2.getCryptoSuite().hash(transactionBytes);
    	var transaction_sig = ecdsa.sign(Buffer.from(transaction_digest, 'hex'), signKey);        
    	transaction_sig = _preventMalleability(transaction_sig);
    	var transaction_signature = Buffer.from(transaction_sig.toDER());

    	var signedTransactionProposal = {
    	  signature: transaction_signature,
    	  proposal_bytes: transactionBytes,
    	};

    	var signedTransaction = {
    	  signedProposal: signedTransactionProposal,
    	  request: commitReq,
		}
		
		channel2.sendSignedTransaction(signedTransaction);

		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send('Transaction has been submitted');
		

	} catch(error) {
		console.log('Unable to invoke ::'+ error.toString());
	}
	console.log('\n\n --- invoke.js - end');
})
*/


app.get('/api/addcar2_1/:carid/:make/:model/:colour/:owner', async function (req, res) {
    try {
		console.log('Created client side object to represent the peer');

		// This sample application uses a file based key value stores to hold
		// the user information and credentials. These are the same stores as used
		// by the 'registerUser.js' sample code
		const store_path = path.join(__dirname, 'hfc-key-store');
		console.log('Setting up the user store at path:'+store_path);
		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		const state_store = await Fabric_Client.newDefaultKeyValueStore({ path: store_path});
		// assign the store to the fabric client
		fabric_client2.setStateStore(state_store);
		const crypto_suite = Fabric_Client.newCryptoSuite();
		// use the same location for the state store (where the users' certificate are kept)
		// and the crypto store (where the users' keys are kept)
		const crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		crypto_suite.setCryptoKeyStore(crypto_store);
		fabric_client2.setCryptoSuite(crypto_suite);

		// get the enrolled user from persistence and assign to the client instance
		//    this user will sign all requests for the fabric network
		const user = await fabric_client2.getUserContext('user3', true);
		if (user && user.isEnrolled()) {
			console.log('Successfully loaded "user3" from user store');
		} else {
			throw new Error('\n\nFailed to get user3.... run registerUser.js');
		}

		console.log('Successfully setup client side');
		console.log('\n\nStart invoke processing');

	
		// Use service discovery to initialize the channel
		await channel2.initialize({ discover: true, asLocalhost: true });
		console.log('Used service discovery to initialize the channel');

		// get a transaction id object based on the current user assigned to fabric client
		// Transaction ID objects contain more then just a transaction ID, also includes
		// a nonce value and if built from the client's admin user.
		const tx_id = fabric_client2.newTransactionID();
		console.log(util.format("\nCreated a transaction ID: %s", tx_id.getTransactionID()));

		// The fabcar chaincode is able to perform a few functions
		//   'createCar' - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom']
		//   'changeCarOwner' - requires 2 args , ex: args: ['CAR10', 'Dave']
		
		const proposal_request = {
			targets: [peer1, peer2, peer3, peer4],
			chaincodeId: 'mycc',
			fcn: 'createCar',
			args: [req.params.carid, req.params.make, req.params.model, req.params.colour, req.params.owner],
			chainId: 'workspace',
			txId: tx_id
		};


		const { proposal, txId } = channel2.generateUnsignedProposal(proposal_request, mspId, cert);

		const proposalBytes = proposal.toBuffer();
		const digest = fabric_client2.getCryptoSuite().hash(proposalBytes);


	
		const resp = {
			digest:digest,
		}

		proposalBytesTmp = proposalBytes;
		//signatureTmp = signature;
		proposalTmp = proposal;

		/////////////////
		res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json({response: resp});

	} catch(error) {
		console.log('Unable to invoke ::'+ error.toString());
	}
	console.log('\n\n --- invoke.js1 - end');
})








var proposalBytesTmp = null;
var proposalTmp = null;
//
var transactionBytesTmp = null;
var commitReqTmp = null;

app.get('/api/changeowner2_1/:carID/:owner', async function (req, res) {
    try {
		console.log('Created client side object to represent the peer');

		// This sample application uses a file based key value stores to hold
		// the user information and credentials. These are the same stores as used
		// by the 'registerUser.js' sample code
		const store_path = path.join(__dirname, 'hfc-key-store');
		console.log('Setting up the user store at path:'+store_path);
		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		const state_store = await Fabric_Client.newDefaultKeyValueStore({ path: store_path});
		// assign the store to the fabric client
		fabric_client2.setStateStore(state_store);
		const crypto_suite = Fabric_Client.newCryptoSuite();
		// use the same location for the state store (where the users' certificate are kept)
		// and the crypto store (where the users' keys are kept)
		const crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		crypto_suite.setCryptoKeyStore(crypto_store);
		fabric_client2.setCryptoSuite(crypto_suite);

		// get the enrolled user from persistence and assign to the client instance
		//    this user will sign all requests for the fabric network
		const user = await fabric_client2.getUserContext('user3', true);
		if (user && user.isEnrolled()) {
			console.log('Successfully loaded "user3" from user store');
		} else {
			throw new Error('\n\nFailed to get user3.... run registerUser.js');
		}

		console.log('Successfully setup client side');
		console.log('\n\nStart invoke processing');

		// Use service discovery to initialize the channel
		await channel2.initialize({ discover: true, asLocalhost: true });
		console.log('Used service discovery to initialize the channel');

		// get a transaction id object based on the current user assigned to fabric client
		// Transaction ID objects contain more then just a transaction ID, also includes
		// a nonce value and if built from the client's admin user.
		const tx_id = fabric_client2.newTransactionID();
		console.log(util.format("\nCreated a transaction ID: %s", tx_id.getTransactionID()));

		// The fabcar chaincode is able to perform a few functions
		//   'createCar' - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom']
		//   'changeCarOwner' - requires 2 args , ex: args: ['CAR10', 'Dave']
		const proposal_request = {
			targets: [peer1, peer2, peer3, peer4],
			chaincodeId: 'mycc',
			fcn: 'changeCarOwner',
			args: [req.params.carID, req.params.owner],
			chainId: 'workspace',
			txId: tx_id
		};


		const { proposal, txId } = channel2.generateUnsignedProposal(proposal_request, mspId, cert);

		const proposalBytes = proposal.toBuffer();
		const digest = fabric_client2.getCryptoSuite().hash(proposalBytes);


		//this has to be done in the client
		//////////////////

	
		const resp = {
			digest:digest,
		}

		proposalBytesTmp = proposalBytes;
		//signatureTmp = signature;
		proposalTmp = proposal;

		/////////////////
		res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json({response: resp});

	} catch(error) {
		console.log('Unable to invoke ::'+ error.toString());
	}
	console.log('\n\n --- invoke.js1 - end');
})



app.post('/api/changeowner2_2/', async function (req, res) {
    try {

		
		signature = Buffer.from(req.body.signature);
		proposalBytes = proposalBytesTmp;
		proposal = proposalTmp;

		//var signature = new Buffer(req.body.signature)
		

		const signedProposal = {
			signature,
			proposal_bytes: proposalBytes,
		};

		var sendSignedProposalReq = {
			signedProposal: signedProposal,
			targets: [peer1, peer2, peer3, peer4]
		}		
		await channel2.initialize({ discover: true, asLocalhost: true });

		const proposalResponses = await channel2.sendSignedProposal(sendSignedProposalReq);

		const commitReq = {
			proposalResponses,
			proposal,
		};
		
		const commitProposal = await channel2.generateUnsignedTransaction(commitReq);

		var transactionBytes = commitProposal.toBuffer();
		var transaction_digest = fabric_client2.getCryptoSuite().hash(transactionBytes);
		

		res.setHeader("Access-Control-Allow-Origin", "*");
		resp = {
			digest:transaction_digest
		};
		transactionBytesTmp = transactionBytes;
		commitReqTmp = commitReq;


		res.status(200).json({response: resp});
		//res.send('Transaction has been submitted');

	} catch(error) {
		console.log('Unable to invoke ::'+ error.toString());
	}
	console.log('\n\n --- invoke.js - end');
})




app.post('/api/changeowner2_3/', async function (req, res) {
    try {

		var transactionBytes = transactionBytesTmp;
		var commitReq = commitReqTmp;
		signature = Buffer.from(req.body.signature);

		var signedTransactionProposal = {
			signature: signature,
			proposal_bytes: transactionBytes,
		};
  
		var signedTransaction = {
			signedProposal: signedTransactionProposal,
			request: commitReq,
		}
		
		channel2.sendSignedTransaction(signedTransaction);

		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send('Transaction has been submitted');
	} catch(error) {
		console.log('Unable to invoke ::'+ error.toString());
	}
	console.log('\n\n --- invoke.js - end');
})





app.listen(8090);