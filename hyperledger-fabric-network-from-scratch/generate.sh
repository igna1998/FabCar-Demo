../bin/cryptogen generate --config=./crypto-config.yaml
export FABRIC_CFG_PATH=$PWD
../bin/configtxgen -profile Raft -channelID workspace-sys-channel -outputBlock ./channel-artifacts/genesis.block

export CHANNEL_NAME=workspace
../bin/configtxgen -profile FourOrgsChannel -outputCreateChannelTx ./channel-artifacts/workspace.tx -channelID $CHANNEL_NAME

../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org3MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org3MSP
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org4MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org4MSP

echo "Now change the FABRIC_CA_SERVER_TLS_KEYFILE variable in docker-compose.yaml"