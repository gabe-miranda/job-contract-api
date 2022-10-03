const { QueryTypes, Op } = require("sequelize");
const { sequelize, Profile } = require("../model");

class AdminHandler {
    static async getBestProfession(start, end) {
        const query = 'SELECT Contracts.ContractorId, SUM(Jobs.price) AS total '
            + 'FROM Contracts INNER JOIN Jobs ON Jobs.ContractId = Contracts.id '
            + 'WHERE Jobs.paid IS TRUE AND Jobs.paymentDate BETWEEN :start AND :end '
            + 'GROUP BY Contracts.ContractorId ORDER BY `total` DESC LIMIT 1';

        const result = await sequelize.query(query, {
            replacements: { start, end },
            type: QueryTypes.SELECT 
        });
        if (!result.length) throw new Error('Result not found for given time range');

        return Profile.findOne({ where: { id: result[0].ContractorId } });
    }

    static async getBestClients(start, end, limit = 2) {
        const query = 'SELECT Contracts.ClientId, SUM(Jobs.price) as total '
        + 'FROM Contracts INNER JOIN Jobs ON Jobs.ContractId = Contracts.id '
        + 'WHERE Jobs.paid IS TRUE AND Jobs.paymentDate BETWEEN :start AND :end '
        + 'GROUP BY Contracts.ClientId ORDER BY `total` DESC LIMIT :limit';

        const result = await sequelize.query(query, {
            replacements: { start, end, limit },
            type: QueryTypes.SELECT
        });
        if (!result.length) throw new Error('Result not found for given time range');
        const client_ids = result.map((row) => row.ClientId);

        const clients = await Profile.findAll({
            attributes: [
                'id',
                [sequelize.literal("firstName || ' ' || lastName"), 'fullName']
            ],
            where: {
                id: { [Op.in]: client_ids }
            }
        });

        return clients.map((client) => {
            const data = client.get();
            const client_row = result.find((row) => row.ClientId === data.id);
            return {
                ...data,
                paid: client_row.total
            };
        });
    }
}

module.exports = AdminHandler;
