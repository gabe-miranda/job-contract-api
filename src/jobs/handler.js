const { Contract, Job, Profile, sequelize } = require('../model');
const ContractsHandler = require('../contracts/handler');
const { Op } = require('sequelize');

class JobsHandler {
    static async getUnpaidJobs(user_id, user_type) {
        const contractOwnerKey = ContractsHandler.getContractOwnerKey(user_type);
        return Job.findAll({
            where: {
                paid: { [Op.not]: true }
            },
            include: [{
                model: Contract,
                attributes: [],
                where: {
                    [contractOwnerKey]: user_id,
                    status: 'in_progress'
                },
            }]
        });
    }

    static async payJob(job_id, payer_id) {
        await sequelize.transaction(async (transaction) => {
            const job = await Job.findOne({
                where: {
                    id: job_id,
                    paid: { [Op.not]: true }
                },
                include: [{
                    model: Contract,
                    where: { status: 'in_progress' }
                }],
                transaction
            });
            if (!job) throw new Error('Job not found or already paid');

            const contractor_id = job.Contract.ContractorId;
            const contract_id = job.Contract.id;
            const job_price = job.price;

            const client = await Profile.findOne({ where: { id: payer_id }, transaction });
            const client_balance = client.balance;

            const contractor = await Profile.findOne({ where: { id: contractor_id }, transaction });
            const contractor_balance = contractor.balance;

            if (client_balance < job_price) throw new Error('Insufficient balance');

            await Profile.update(
                { balance: (client_balance - job_price) },
                { where: { id: payer_id }, transaction }
            );
            await Profile.update(
                { balance: (contractor_balance + job_price) },
                { where: { id: contractor_id }, transaction }
            );
            await Job.update(
                { paid: true, paymentDate: sequelize.literal('CURRENT_TIMESTAMP') },
                { where: { id: job_id }, transaction }
            );
        });
    }
}

module.exports = JobsHandler;
