import { SFContact } from 'services/salesforce.interfaces';

export default class SalesForceSerializer {

    static serializeContact(el: SFContact): SFContact {
        return {
            Id: el.Id,
            FirstName: el.FirstName,
            LastName: el.LastName,
            Email: el.Email,
            Personal_Email__c: el.Personal_Email__c,
            Work_Email__c: el.Work_Email__c,
            Alternate_Email__c: el.Alternate_Email__c,
        };
    }

}
