import { SFContact, SFContactResponse } from 'services/salesforce.interfaces';

interface JSONAPIResponse {
    data: SFContactResponse | SFContactResponse[];
}

export default class SalesForceSerializer {

    static serializeContact(el: SFContact): SFContactResponse {
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

    static serialize(data: SFContact | SFContact[]): JSONAPIResponse {
        const result: JSONAPIResponse = {
            data: [],
        };
        if (data && Array.isArray(data) && data.length === 0) {
            return result;
        }
        if (data) {
            if (Array.isArray(data)) {
                result.data = data.map((contact) => SalesForceSerializer.serializeContact(contact));
            } else {
                result.data = SalesForceSerializer.serializeContact(data);
            }
        }
        return result;
    }

}
