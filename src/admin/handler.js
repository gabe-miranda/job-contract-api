const { QueryTypes } = require("sequelize");
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
}

module.exports = AdminHandler;
