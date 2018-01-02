const contractServer = ({ contracts, rpcEndpoint }) => ({
  start: () => {
    const express = require('express');
    const app = express();

    // Required to receive calls from browser
    const cors = require('cors');
    app.use(cors());

    const port = 3000;

    app.get('/', (req, res) => {
      res.send({
        contracts,
        rpcEndpoint,
      });
    });

    app.listen(port, () => console.log(`Contract server listening on port ${port}`));
  }
});

module.exports = {
  contractServer
};
