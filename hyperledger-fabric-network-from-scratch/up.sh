export COMPOSE_PROJECT_NAME=net
export IMAGE_TAG=latest
export SYS_CHANNEL=workspace-sys-channel
docker-compose -f docker-compose.yaml up -d

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/factory.workspace/users/Admin@factory.workspace/msp
export CORE_PEER_ADDRESS=peer1.factory.workspace:7051
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/factory.workspace/peers/peer1.factory.workspace/tls/ca.crt
export CHANNEL_NAME=workspace
docker exec -e CORE_PEER_LOCALMSPID=Org1MSP -e CORE_PEER_ADDRESS=peer1.factory.workspace:7051 -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/factory.workspace/users/Admin@factory.workspace/msp -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/factory.workspace/peers/peer1.factory.workspace/tls/ca.crt cli peer channel create \
    -o orderer1.workspace:7050 \
    -c $CHANNEL_NAME \
    -f ./channel-artifacts/$CHANNEL_NAME.tx \
    --outputBlock ./$CHANNEL_NAME.block \
    --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/workspace/orderers/orderer1.workspace/msp/tlscacerts/tlsca.workspace-cert.pem

docker exec cli peer channel join -b ./workspace.block
docker exec cli peer channel update \
	-o orderer1.workspace:7050 \
	-c $CHANNEL_NAME \
	-f ./channel-artifacts/Org1MSPanchors.tx \
	--tls \
	--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/workspace/orderers/orderer1.workspace/msp/tlscacerts/tlsca.workspace-cert.pem

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/delivery.workspace/users/Admin@delivery.workspace/msp
export CORE_PEER_ADDRESS=peer1.delivery.workspace:9051
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/delivery.workspace/peers/peer1.delivery.workspace/tls/ca.crt
docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_ADDRESS=peer1.delivery.workspace:9051 -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/delivery.workspace/users/Admin@delivery.workspace/msp -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/delivery.workspace/peers/peer1.delivery.workspace/tls/ca.crt cli peer channel join -b ./workspace.block
docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_ADDRESS=peer1.delivery.workspace:9051 -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/delivery.workspace/users/Admin@delivery.workspace/msp -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/delivery.workspace/peers/peer1.delivery.workspace/tls/ca.crt cli peer channel update \
	-o orderer1.workspace:7050 \
	-c $CHANNEL_NAME \
	-f ./channel-artifacts/Org2MSPanchors.tx \
	--tls \
	--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/workspace/orderers/orderer1.workspace/msp/tlscacerts/tlsca.workspace-cert.pem

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point1.workspace/users/Admin@sales-point1.workspace/msp
export CORE_PEER_ADDRESS=peer1.sales-point1.workspace:11051
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point1.workspace/peers/peer1.sales-point1.workspace/tls/ca.crt
docker exec -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_ADDRESS=peer1.sales-point1.workspace:11051 -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point1.workspace/users/Admin@sales-point1.workspace/msp -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point1.workspace/peers/peer1.sales-point1.workspace/tls/ca.crt cli peer channel join -b ./workspace.block
docker exec -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_ADDRESS=peer1.sales-point1.workspace:11051 -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point1.workspace/users/Admin@sales-point1.workspace/msp -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point1.workspace/peers/peer1.sales-point1.workspace/tls/ca.crt cli peer channel update \
	-o orderer1.workspace:7050 \
	-c $CHANNEL_NAME \
	-f ./channel-artifacts/Org3MSPanchors.tx \
	--tls \
	--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/workspace/orderers/orderer1.workspace/msp/tlscacerts/tlsca.workspace-cert.pem

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point2.workspace/users/Admin@sales-point2.workspace/msp
export CORE_PEER_ADDRESS=peer1.sales-point2.workspace:13051
export CORE_PEER_LOCALMSPID="Org4MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point2.workspace/peers/peer1.sales-point2.workspace/tls/ca.crt
docker exec -e CORE_PEER_LOCALMSPID=Org4MSP -e CORE_PEER_ADDRESS=peer1.sales-point2.workspace:13051 -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point2.workspace/users/Admin@sales-point2.workspace/msp -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point2.workspace/peers/peer1.sales-point2.workspace/tls/ca.crt cli peer channel join -b ./workspace.block
docker exec -e CORE_PEER_LOCALMSPID=Org4MSP -e CORE_PEER_ADDRESS=peer1.sales-point2.workspace:13051 -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point2.workspace/users/Admin@sales-point2.workspace/msp -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sales-point2.workspace/peers/peer1.sales-point2.workspace/tls/ca.crt cli peer channel update \
	-o orderer1.workspace:7050 \
	-c $CHANNEL_NAME \
	-f ./channel-artifacts/Org4MSPanchors.tx \
	--tls \
	--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/workspace/orderers/orderer1.workspace/msp/tlscacerts/tlsca.workspace-cert.pem
