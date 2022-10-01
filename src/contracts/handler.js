const { Contract } = require('../model');
const { Op } = require('sequelize');

class ContractsHandler {
    static async getContractById(contract_id, user_id, user_type) {
        const ownerKey = this.getContractOwnerKey(user_type);
        return Contract.findOne({
            where: {
                id: contract_id,
                [ownerKey]: user_id
            }
        });
    }

    static async getNonTerminatedContracts(user_id, user_type) {
        const ownerKey = this.getContractOwnerKey(user_type);
        return Contract.findAll({
            where: {
                [ownerKey]: user_id,
                status: {
                    [Op.not]: 'terminated'
                }
            }
        });
    }

    static getContractOwnerKey(user_type) {
        return user_type === 'contractor'
            ? 'ContractorId'
            : 'ClientId';
    }
}

module.exports = ContractsHandler;
