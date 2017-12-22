const version = require("./lib/version");

console.log(`DAV CLI v${version} - makes developing with DAV easy`);
console.log();

const ganache = require("ganache-cli");
const server = ganache.server();
const port = 8545;
server.listen(port, (err, blockchain) => {
  console.log(`Local Ethereum node running. Port ${port}.`);
});
