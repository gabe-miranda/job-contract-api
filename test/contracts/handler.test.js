const ContractsHandler = require('../../src/contracts/handler');
const { Contract } = require('../../src/model');
const { Op } = require('sequelize');

describe('ContractsHandler', () => {
    beforeEach(() => {
        jest.spyOn(Contract, 'findOne')
            .mockImplementation(() => ({ foo: 'bar' }));
        jest.spyOn(Contract, 'findAll')
            .mockImplementation(() => ([{ foo: 'bar' }, { barz: 'fooz' }]));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getContractById', () => {
        it('return specific contract for given user', async () => {
            const contract_id = 42;
            const user_id = 13;
            const user_type = 'contractor';

            await ContractsHandler.getContractById(contract_id, user_id, user_type);

            expect(Contract.findOne).toHaveBeenCalledWith({
                where: {
                    id: contract_id,
                    ContractorId: user_id
                }
            });
        });
    });

    describe('getNonTerminatedContracts', () => {
        it('return all non terminated contracts for given user', async () => {
            const user_id = 123;
            const user_type = 'client';

            await ContractsHandler.getNonTerminatedContracts(user_id, user_type);

            expect(Contract.findAll).toHaveBeenCalledWith({
                where: {
                    ClientId: user_id,
                    status: { [Op.not]: 'terminated' }
                }
            });
        });
    });

    describe('getContractOwnerKey', () => {
        it('match contractor user type to foreign key name', () => {
            const ownerKey = ContractsHandler.getContractOwnerKey('contractor');

            expect(ownerKey).toEqual('ContractorId');
        });

        it('match client user type to foreign key name', () => {
            const ownerKey = ContractsHandler.getContractOwnerKey('client');

            expect(ownerKey).toEqual('ClientId');
        });
    });
});