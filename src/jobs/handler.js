const { Contract, Job } = require('../model');
const ContractsHandler = require('../contracts/handler');
const { Op } = require('sequelize');

class JobsHandler {
    static async getUnpaidJobs(user_id, user_type) {
        const contractOwnerKey = ContractsHandler.getContractOwnerKey(user_type);
        return Job.findAll({
            where: {
                paid: {
                    [Op.not]: true
                }
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
}

module.exports = JobsHandler;