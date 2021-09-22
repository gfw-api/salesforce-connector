import chai from 'chai';
import nock from 'nock';
import sinon, { SinonSandbox } from 'sinon';
import request from 'superagent';
import { closeTestAgent, getTestAgent } from './utils/test.server';
import { stubJSForce } from './utils/jsforce.stub';
import { SFContact } from '../src/services/salesforce.interfaces';
import SFContactFactory from './utils/sfcontact.factory';
import { mockGetUserFromToken } from './utils/helpers';
import { USERS } from './utils/test.constants';


let requester: ChaiHttp.Agent;
let sandbox: SinonSandbox;

chai.should();

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Log Salesforce contact actions', () => {
    beforeEach(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        sandbox = sinon.createSandbox();
    });

    it('Logging a SF contact action for a contact without all the required fields returns a 400 error message', async () => {
        requester = await getTestAgent(true);

        const response: request.Response = await requester
            .post(`/api/v1/salesforce/contact/log-action`)
            .send({});

        response.status.should.equal(400);
        response.body.should.be.an('object').and.have.property('errors');
        response.body.errors.should.be.an('array').and.have.length(1);
        response.body.errors[0].should.have.property('detail', '"email" is required');
    });

    it('Logging a SF contact action with an invalid field returns a 400 error message', async () => {
        requester = await getTestAgent(true);

        const response: request.Response = await requester
            .post(`/api/v1/salesforce/contact/log-action`)
            .send({
                email: 'user@email.com',
                potato: 'user@email.com'
            });

        response.status.should.equal(400);
        response.body.should.be.an('object').and.have.property('errors');
        response.body.errors.should.be.an('array').and.have.length(1);
        response.body.errors[0].should.have.property('detail', '"potato" is not allowed');
    });

    it('Logging a SF contact action for a contact that does not exist creates a new record with Email and without Individual ID', async () => {
        const { methodStubs } = stubJSForce(sandbox, {
            find: [],
            create:
                [{
                    'success': true
                }]
        });

        requester = await getTestAgent(true);

        const response: request.Response = await requester
            .post(`/api/v1/salesforce/contact/log-action`)
            .send({
                email: 'test@donotsavethis.com',
                primaryRole: 'abcd'
            });

        response.status.should.equal(201);

        sandbox.assert.calledOnce(methodStubs.find);
        sandbox.assert.calledWith(methodStubs.find, {
            '$or': [
                { 'Email': { '$like': 'test@donotsavethis.com' } },
                { 'Personal_Email__c': { '$like': 'test@donotsavethis.com' } },
                { 'Work_Email__c': { '$like': 'test@donotsavethis.com' } },
                { 'Alternate_Email__c': { '$like': 'test@donotsavethis.com' } }
            ]
        });

        sandbox.assert.calledOnce(methodStubs.create);
        sandbox.assert.calledWith(methodStubs.create, [{
            Primary_Role__c: 'abcd',
            Email__c: 'test@donotsavethis.com'
        }]);
    });

    it('Logging a SF contact action for a contact that exists creates a new record without Email and with Individual ID', async () => {
        const sfContact: SFContact = SFContactFactory.get({ Email: 'test2@email.com' });

        // Ensure stub is called before starting the test server
        const { methodStubs } = stubJSForce(sandbox, {
            find: [sfContact],
            create:
                [{
                    'success': true
                }]
        });

        requester = await getTestAgent(true);

        const response: request.Response = await requester
            .post(`/api/v1/salesforce/contact/log-action`)
            .send({
                email: 'test@donotsavethis.com',
                primaryRole: 'abcd'
            });

        response.status.should.equal(201);

        sandbox.assert.calledOnce(methodStubs.find);
        sandbox.assert.calledWith(methodStubs.find, {
            '$or': [
                { 'Email': { '$like': 'test@donotsavethis.com' } },
                { 'Personal_Email__c': { '$like': 'test@donotsavethis.com' } },
                { 'Work_Email__c': { '$like': 'test@donotsavethis.com' } },
                { 'Alternate_Email__c': { '$like': 'test@donotsavethis.com' } }
            ]
        });

        sandbox.assert.calledOnce(methodStubs.create);
        sandbox.assert.calledWith(methodStubs.create, [{
            Primary_Role__c: 'abcd',
            Email__c: 'test@donotsavethis.com',
            Potential_Individual_ID__c: sfContact.External_Id__c
        }]);
    });

    it('Logging a SF contact action for a contact that exists creates a new record without Email and with Individual ID - authenticated user', async () => {
        mockGetUserFromToken(USERS.ADMIN);
        const sfContact: SFContact = SFContactFactory.get({ Email: 'test2@email.com' });

        // Ensure stub is called before starting the test server
        const { methodStubs } = stubJSForce(sandbox, {
            find: [sfContact],
            create:
                [{
                    'success': true
                }]
        });

        requester = await getTestAgent(true);

        const response: request.Response = await requester
            .post(`/api/v1/salesforce/contact/log-action`)
            .set('Authorization', `Bearer abcd`)
            .send({
                email: 'test@donotsavethis.com',
                primaryRole: 'abcd'
            });

        response.status.should.equal(201);

        sandbox.assert.calledOnce(methodStubs.find);
        sandbox.assert.calledWith(methodStubs.find, {
            '$or': [
                { 'Email': { '$like': 'test@donotsavethis.com' } },
                { 'Personal_Email__c': { '$like': 'test@donotsavethis.com' } },
                { 'Work_Email__c': { '$like': 'test@donotsavethis.com' } },
                { 'Alternate_Email__c': { '$like': 'test@donotsavethis.com' } }
            ]
        });

        sandbox.assert.calledOnce(methodStubs.create);
        sandbox.assert.calledWith(methodStubs.create, [{
            Primary_Role__c: 'abcd',
            Email__c: 'test@donotsavethis.com',
            Potential_Individual_ID__c: sfContact.External_Id__c
        }]);
    });

    afterEach(async () => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }

        sandbox.restore();
        await closeTestAgent();
    });
});
