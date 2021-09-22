/**
 * What we get when querying the SF API for Contacts
 */
export interface SFContactResponse {
    Id: string;
    LastName: string;
    FirstName: string;
    Email: string | null;
    Personal_Email__c: string | null;
    Work_Email__c: string | null;
    Alternate_Email__c: string | null;
}

/**
 * What we send out as API responses when users query for Contacts
 */
export interface SFContact extends SFContactResponse{
    External_Id__c: string | null;
}

export interface SFDataImportRecord {
    Account_Name__c?: string;
    City_of_Interest__c?: string;
    Collab_Summary__c?: string;
    Community_Member_Type__c?: string;
    Country_of_Interest__c?: string;
    Email__c?: string;
    First_Name__c?: string;
    GFW_Contact_Type__c?: string;
    Last_Name__c?: string;
    Partner_Type__c?: string;
    Potential_Individual_ID__c?: string;
    Preferred_Language__c?: string;
    Primary_Role__c?: string;
    Sector__c?: string;
    Source_of_Contact_Creation__c?: string;
    State_Department_Province_of_Interest__c?: string;
    Title__c?: string;
    Topics_of_Interest__c?: string;
}
