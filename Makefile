SHELL:=bash

run:
	clear
	pushd ../contracts && npm run build && popd
	cp ../contracts/build/contracts/DAVToken.json contracts
	cp ../contracts/build/contracts/Identity.json contracts
	cp ../contracts/build/contracts/BasicMission.json contracts
	npm start
