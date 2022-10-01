const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile');
const ContractsHandler = require('./contracts/handler');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
    const { id: contract_id } = req.params;
    const { id: user_id, type: user_type } = req.profile;
    const contract = await ContractsHandler.getContractById(contract_id, user_id, user_type);
    if (!contract) return res.status(404).end();
    res.json(contract);
});

app.get('/contracts', getProfile, async (req, res) => {
    const { id: user_id, type: user_type } = req.profile;
    const contracts = await ContractsHandler.getNonTerminatedContracts(user_id, user_type);
    if (!contracts.length) return res.status(404).end();
    res.json(contracts);
});

module.exports = app;
