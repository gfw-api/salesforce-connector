import chai from 'chai';
import nock from 'nock';
import sinon, { SinonSandbox } from 'sinon';
import request from 'superagent';

import {SFContact} from 'services/salesforce.interfaces';
import {closeTestAgent, getTestAgent} from './utils/test.server';
import {stubJSForce} from './utils/jsforce.stub';
import SFContactFactory from './utils/sfcontact.factory';

let requester: ChaiHttp.Agent;
let sandbox: SinonSandbox;

chai.should();

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Find Salesforce contacts by last name', () => {
    beforeEach(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        sandbox = sinon.createSandbox();
    });

    it('Finding a SF contact by last name for a contact that does not exist returns 404 Not Found', async () => {
        // Ensure stub is called before starting the test server
        const { findStub } = stubJSForce(sandbox);

        requester = await getTestAgent(true);

        const lastName: string = 'test';
        const response: request.Response = await requester.get(`/salesforce/contact/${lastName}`);
        response.status.should.equal(404);
        response.body.should.be.an('object').and.have.property('errors');
        response.body.errors.should.be.an('array').and.have.length(1);
        response.body.errors[0].should.have.property('detail', 'Contact not found');

        sandbox.assert.calledOnce(findStub);
        sandbox.assert.calledWith(findStub, {
            '$or': [
                { 'LastName': { '$like': lastName } },
                { 'Email': { '$like': lastName } },
                { 'Personal_Email__c': { '$like': lastName } },
                { 'Work_Email__c': { '$like': lastName } },
                { 'Alternate_Email__c': { '$like': lastName } }
            ]
        });
    });

    it('Finding a SF contact by email for a contact that exists returns 200 OK with the contact information', async () => {
        const sfContact: SFContact = SFContactFactory.get({ LastName: 'test2' });

        // Ensure stub is called before starting the test server
        const { findStub } = stubJSForce(sandbox, [sfContact]);

        requester = await getTestAgent(true);

        const lastName: string = 'test2@email.com';
        const response: request.Response = await requester.get(`/salesforce/contact/${lastName}`);
        response.status.should.equal(200);
        response.body.should.be.an('object').and.have.property('data');
        response.body.data.should.have.property('Id', sfContact.Id);
        response.body.data.should.have.property('FirstName', sfContact.FirstName);
        response.body.data.should.have.property('LastName', sfContact.LastName);
        response.body.data.should.have.property('Email', sfContact.Email);
        response.body.data.should.have.property('Personal_Email__c', sfContact.Personal_Email__c);
        response.body.data.should.have.property('Work_Email__c', sfContact.Work_Email__c);
        response.body.data.should.have.property('Alternate_Email__c', sfContact.Alternate_Email__c);

        sandbox.assert.calledOnce(findStub);
        sandbox.assert.calledWith(findStub, {
            '$or': [
                { 'LastName': { '$like': lastName } },
                { 'Email': { '$like': lastName } },
                { 'Personal_Email__c': { '$like': lastName } },
                { 'Work_Email__c': { '$like': lastName } },
                { 'Alternate_Email__c': { '$like': lastName } }
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
