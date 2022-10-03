const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile');
const ContractsHandler = require('./contracts/handler');
const JobsHandler = require('./jobs/handler');
const BalancesHandler = require('./balances/handler');
const AdminHandler = require('./admin/handler');
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

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const { id: user_id, type: user_type } = req.profile;
    const jobs = await JobsHandler.getUnpaidJobs(user_id, user_type);
    if (!jobs.length) return res.status(404).end();
    res.json(jobs);
});

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    try {
        const { job_id } = req.params;
        const { id: user_id, type: user_type } = req.profile;
        if (user_type !== 'client') return res.status(401).end();
        await JobsHandler.payJob(job_id, user_id);
        return res.status(200).end();
    } catch (error) {
        res.status(400).json({ reason: error.message });
    }
});

app.post('/balances/deposit/:user_id', getProfile, async (req, res) => {
    try {
        const { user_id } = req.params;
        const { amount } = req.body;
        await BalancesHandler.addBalance(user_id, amount);
        return res.status(200).end();
    } catch (error) {
        res.status(400).json({ reason: error.message });
    }
});

app.get('/admin/best-profession', getProfile, async (req, res) => {
    try {
        const { start, end } = req.query;
        const result = await AdminHandler.getBestProfession(start, end);
        res.json(result);
    } catch (error) {
        res.status(404).json({ reason: error.message });
    }
});

module.exports = app;
