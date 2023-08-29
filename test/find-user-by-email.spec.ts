import chai from 'chai';
import nock from 'nock';
import sinon, { SinonSandbox } from 'sinon';
import request from 'superagent';

import { SFContact } from 'services/salesforce.interfaces';
import { closeTestAgent, getTestAgent } from './utils/test.server';
import { stubJSForce } from './utils/jsforce.stub';
import SFContactFactory from './utils/sfcontact.factory';
import {
    mockValidateRequestWithApiKey,
    mockValidateRequestWithApiKeyAndUserToken
} from './utils/helpers';
import { USERS } from './utils/test.constants';

let requester: ChaiHttp.Agent;
let sandbox: SinonSandbox;

chai.should();

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Find Salesforce contacts by email', () => {
    beforeEach(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        sandbox = sinon.createSandbox();
    });

    it('Finding a SF contact without providing the email query param returns 400 Bad Request', async () => {
        mockValidateRequestWithApiKey({});
        requester = await getTestAgent(true);

        const response: request.Response = await requester
            .get(`/api/v1/salesforce/contact/search`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(400);
        response.body.should.be.an('object').and.have.property('errors');
        response.body.errors.should.be.an('array').and.have.length(1);
        response.body.errors[0].should.have.property('detail', '"email" is required');
    });

    it('Finding a SF contact by email for a contact that does not exist returns 404 Not Found', async () => {
        mockValidateRequestWithApiKey({});
        // Ensure stub is called before starting the test server
        const { methodStubs } = stubJSForce(sandbox, { find: [] });

        requester = await getTestAgent(true);

        const searchCriteria: string = 'test@email.com';
        const response: request.Response = await requester
            .get(`/api/v1/salesforce/contact/search`)
            .set('x-api-key', 'api-key-test')
            .query({
                email: searchCriteria
            });

        response.status.should.equal(404);
        response.body.should.be.an('object').and.have.property('errors');
        response.body.errors.should.be.an('array').and.have.length(1);
        response.body.errors[0].should.have.property('detail', 'Contact not found');

        sandbox.assert.calledOnce(methodStubs.find);
        sandbox.assert.calledWith(methodStubs.find, {
            '$or': [
                { 'Email': { '$like': searchCriteria } },
                { 'Personal_Email__c': { '$like': searchCriteria } },
                { 'Work_Email__c': { '$like': searchCriteria } },
                { 'Alternate_Email__c': { '$like': searchCriteria } }
            ]
        });
    });

    it('Finding a SF contact by email for a contact that exists returns 200 OK with the contact information - no auth token', async () => {
        mockValidateRequestWithApiKey({});
        const sfContact: SFContact = SFContactFactory.get({ Email: 'test2@email.com' });

        // Ensure stub is called before starting the test server
        const { methodStubs } = stubJSForce(sandbox, { find: [sfContact] });

        requester = await getTestAgent(true);

        const searchCriteria: string = 'henrique.pacheco@vizzuality.com';
        const response: request.Response = await requester
            .get(`/api/v1/salesforce/contact/search`)
            .set('x-api-key', 'api-key-test')
            .query({
                email: searchCriteria
            });

        response.status.should.equal(200);
        response.body.should.be.an('object').and.have.property('data');
        response.body.data.should.be.an('array').and.have.length(1);
        response.body.data[0].should.have.property('Id', sfContact.Id);
        response.body.data[0].should.have.property('FirstName', sfContact.FirstName);
        response.body.data[0].should.have.property('LastName', sfContact.LastName);
        response.body.data[0].should.have.property('Email', sfContact.Email);
        response.body.data[0].should.have.property('Personal_Email__c', sfContact.Personal_Email__c);
        response.body.data[0].should.have.property('Work_Email__c', sfContact.Work_Email__c);
        response.body.data[0].should.have.property('Alternate_Email__c', sfContact.Alternate_Email__c);

        sandbox.assert.calledOnce(methodStubs.find);
        sandbox.assert.calledWith(methodStubs.find, {
            '$or': [
                { 'Email': { '$like': searchCriteria } },
                { 'Personal_Email__c': { '$like': searchCriteria } },
                { 'Work_Email__c': { '$like': searchCriteria } },
                { 'Alternate_Email__c': { '$like': searchCriteria } }
            ]
        });
    });

    it('Finding a SF contact by email for a contact that exists returns 200 OK with the contact information - authenticated user', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

        const sfContact: SFContact = SFContactFactory.get({ Email: 'test2@email.com' });

        // Ensure stub is called before starting the test server
        const { methodStubs } = stubJSForce(sandbox, { find: [sfContact] });

        requester = await getTestAgent(true);

        const searchCriteria: string = 'henrique.pacheco@vizzuality.com';
        const response: request.Response = await requester
            .get(`/api/v1/salesforce/contact/search`)
            .set('x-api-key', 'api-key-test')
            .set('Authorization', `Bearer abcd`)
            .query({
                email: searchCriteria
            });

        response.status.should.equal(200);
        response.body.should.be.an('object').and.have.property('data');
        response.body.data.should.be.an('array').and.have.length(1);
        response.body.data[0].should.have.property('Id', sfContact.Id);
        response.body.data[0].should.have.property('FirstName', sfContact.FirstName);
        response.body.data[0].should.have.property('LastName', sfContact.LastName);
        response.body.data[0].should.have.property('Email', sfContact.Email);
        response.body.data[0].should.have.property('Personal_Email__c', sfContact.Personal_Email__c);
        response.body.data[0].should.have.property('Work_Email__c', sfContact.Work_Email__c);
        response.body.data[0].should.have.property('Alternate_Email__c', sfContact.Alternate_Email__c);

        sandbox.assert.calledOnce(methodStubs.find);
        sandbox.assert.calledWith(methodStubs.find, {
            '$or': [
                { 'Email': { '$like': searchCriteria } },
                { 'Personal_Email__c': { '$like': searchCriteria } },
                { 'Work_Email__c': { '$like': searchCriteria } },
                { 'Alternate_Email__c': { '$like': searchCriteria } }
            ]
        });
    });

    afterEach(async () => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }

        sandbox.restore();
        await closeTestAgent();
    });
});
