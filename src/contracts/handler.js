const { Contract } = require('../model');

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

    static getContractOwnerKey(user_type) {
        return user_type === 'contractor'
            ? 'ContractorId'
            : 'ClientId';
    }
}

module.exports = ContractsHandler;
