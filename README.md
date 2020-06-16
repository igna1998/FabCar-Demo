# FabCar-Demo
Hyperledger Fabric app development demostration


## Steps to run the demo
### Step 1: Download Fabric and it's prerequisites and place everything
First download and install the Fabric prerequisites:
```
https://hyperledger-fabric.readthedocs.io/en/release-2.0/prereqs.html
```
Our demo works with Fabric 1.4.4 (last stable version at the start of the project).
```
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 1.4.4
```
When everything is downloaded, go to fabric-samples and clone the content of this repository.

### Step 2: Create and deploy the network with it's chaincode
For this, go to hyperledger-fabric-network-from-scratch and:
```
 mkdir channel-artifacts
 ./generate.sh
```
Now we need to modify docker-compose.yaml to use the new certificates.
For this, open this file, and look for FABRIC_CA_SERVER_TLS_KEYFILE variable. You would see a ke, ending in sk. A couple of lines down you can find the same key. We need to replace this two with the correct one for every organization. For this, go to crypto-config/peerOrganizations/[one organization].workspace/ca. Reeplace the line in doccker-compose.yaml with the name of the file. Do this for every organization(four).

Now deploy the network and install the chaicode.
```
 ./up.sh
 ./install-fabcar.sh
```
### Step 3: Enroll admin and first user(optional because I give one preregistered user)

Go to fabcar/javascript-low-level and:
  ```
  npm install
  node enrollAdmin.js
  node registerUser.js
  ```
### Step 4: REST API and Frontend
Now we can start our REST API. For this stay in the folder and execute 
  ```
  node apiserver_secure.js
  ```
Open another terminal in the repository folder and move to fabcar-front end and:
  ```
  npm install
  npm start
  ```
If everything goes well we should see the frontend.

The Private Keys are saved into hfc-key-store into the fabcar/javascript-low-level folder.
There is one previously created private key stored into privkey.pem file.
Paste the full content of this file when making transactions to obtain a successful result.
