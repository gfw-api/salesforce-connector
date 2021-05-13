import config from 'config';
import jsforce, {Connection} from 'jsforce';
import logger from 'logger';

import { SFContact } from 'services/salesforce.interfaces';
import ContactNotFoundError from "../errors/contact-not-found.error";

class SalesforceService {
    private readonly url: string;
    private readonly username: string;
    private readonly password: string;
    private connection: Connection;

    constructor() {
        logger.info('[SalesforceService] Initializing SF service...');

        this.url = config.get('salesforce.url');
        this.username = config.get('salesforce.username');
        this.password = config.get('salesforce.password');

        if (!this.url || !this.username || !this.password) {
            throw new Error('Not all SF connection env variables are present.');
        }

        this.connection = new jsforce.Connection({ loginUrl: this.url });
    }

    async login() {
        await this.connection.login(this.username, this.password);
        logger.info('[SalesforceService] Connection to SF successful');
    }

    async findContactByEmail(email: string): Promise<SFContact> {
        await this.login();

        const results = await this.connection.sobject("Contact").find({
            $or: [
                { Email: { $like: email } },
                { Personal_Email__c: { $like: email } },
                { Work_Email__c: { $like: email } },
                { Alternate_Email__c: { $like: email } },
            ]
        });

        if (!results || !results[0]) {
            throw new ContactNotFoundError();
        }

        return results[0] as unknown as SFContact;
    }
}

export default new SalesforceService();
