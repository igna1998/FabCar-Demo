'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode query
 */
var fs = require('fs');
var path = require('path');


const privateKeyPath = path.resolve(__dirname, '../../hyperledger-fabric-network-from-scratch/crypto-config/peerOrganizations/factory.workspace/users/User1@factory.workspace/msp/keystore/94d5edeac5d59c0db9327e1b3d93b7a85a2d85c6c30fe6b50374c1a0709906dc_sk');
const priv = fs.readFileSync(privateKeyPath, 'utf8');
const certPath = path.resolve(__dirname, '../../hyperledger-fabric-network-from-scratch/crypto-config/peerOrganizations/factory.workspace/users/User1@factory.workspace/msp/signcerts/User1@factory.workspace-cert.pem');
const cert = fs.readFileSync(certPath, 'utf8');



/////////////////////////////////

var Fabric_Client = require('fabric-client');

var network_path = path.resolve('..', '..', 'hyperledger-fabric-network-from-scratch');
var org1tlscacert_path = path.resolve(network_path, 'crypto-config', 'peerOrganizations', 'factory.workspace', 'tlsca', 'tlsca.factory.workspace-cert.pem');
var org1tlscacert = fs.readFileSync(org1tlscacert_path, 'utf8');

//
var fabric_client = new Fabric_Client();

// setup the fabric network
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
	return fabric_client.getUserContext('user1', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded user1 from persistence');
	} else {
		throw new Error('Failed to get user1.... run registerUser.js');
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
			console.log("Response is ", query_responses[0].toString());
		}
	} else {
		console.log("No payloads were returned from query");
	}
}).catch((err) => {
	console.error('Failed to query successfully :: ' + err);
});
