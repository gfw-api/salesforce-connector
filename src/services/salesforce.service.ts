import { Connection } from 'jsforce';

import ContactNotFoundError from 'errors/contact-not-found.error';
import { SFContact } from 'services/salesforce.interfaces';

import { connect } from './salesforce-connection.service';

export default class SalesforceService {
    static async findContactByEmail(email: string): Promise<SFContact> {
        const connection: Connection = await connect();
        const results = await connection.sobject("Contact").find({
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
