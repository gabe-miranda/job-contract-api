const { Op } = require("sequelize");
const { sequelize, Profile, Contract, Job } = require("../model");

class BalancesHandler {
    static async addBalance(user_id, amount) {
        await sequelize.transaction(async (transaction) => {
            const client = await Profile.findOne({
                where: {
                    id: user_id,
                    type: 'client'
                },
                transaction
            });
            if (!client) throw new Error('Client not found');
            const client_balance = client.balance;
            console.log('balance', client_balance);

            const contracts = await Contract.findAll({
                where: {
                    ClientId: user_id,
                    status: { [Op.not]: 'terminated' }
                },
                include: {
                    model: Job,
                    attributes: ['price'],
                    where: {
                        paid: { [Op.not]: true }
                    }
                },
                transaction
            });

            let jobs_total_amount = 0;
            contracts.map((contract) => {
                if (!contract.Jobs.length) return;
                if (contract.Jobs.length === 1) {
                    jobs_total_amount += contract.Jobs[0].price;
                    return;
                }
                const jobs_prices = contract.Jobs.reduce((acc, cur) => ( acc.price + cur.price ));
                jobs_total_amount += jobs_prices;
            });

            const allowed_deposit = jobs_total_amount/4;
            if (amount > allowed_deposit) throw new Error('Amount exceeds maximum deposit limit');

            await Profile.update(
                { balance: (client_balance + amount) },
                { where: { id: user_id }, transaction }
            );

        });
    }
}

module.exports = BalancesHandler;