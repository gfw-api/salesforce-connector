import { Connection } from 'jsforce';

import ContactNotFoundError from 'errors/contact-not-found.error';
import { SFContact } from 'services/salesforce.interfaces';

import { connect } from './salesforce-connection.service';

export default class SalesforceService {
    static async findContactByEmailOrLastName(search: string): Promise<SFContact> {
        const connection: Connection = await connect();
        const results: SFContact[] = await connection.sobject('Contact').find({
            $or: [
                { LastName: { $like: search } },
                { Email: { $like: search } },
                { Personal_Email__c: { $like: search } },
                { Work_Email__c: { $like: search } },
                { Alternate_Email__c: { $like: search } },
            ]
        });

        if (!results || !results[0]) {
            throw new ContactNotFoundError();
        }

        return results[0];
    }
}
