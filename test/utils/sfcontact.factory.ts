import { SFContact } from 'services/salesforce.interfaces';

export default class SFContactFactory {
    static get(override: Partial<SFContact> = {}): SFContact {
        return {
            'Id': '0032f00000UceTOZIO',
            'FirstName': 'Test',
            'LastName': 'User',
            'Email': 'test.user@work.com',
            'Personal_Email__c': 'testuser@personal.com',
            'Work_Email__c': 'test.user@work.com',
            'Alternate_Email__c': null,
            'External_Id__c': '0032f00000UceTOZIO',
            ...override,
        };
    }
}
