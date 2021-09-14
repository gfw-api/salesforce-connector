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
    Alternate_Email__c?: string;
    Assistant__c?: string;
    Assistant_Email_Address__c?: string;
    Asst_Phone__c?: string;
    City_of_Interest__c?: string;
    Collab_Summary__c?: string;
    Community_Member_Type__c?: string;
    Country_of_Interest__c?: string;
    Department__c?: string;
    First_Name__c?: string;
    Geographic_Region__c?: string;
    Grade_Level__c?: string;
    Imported_Account__c?: string;
    Imported_Contact__c?: string;
    Invalid_Email_Address__c?: string;
    Last_Name__c?: string;
    Nickname__c?: string;
    Partner_Type__c?: string;
    Personal_Email__c?: string;
    Potential_Individual_ID__c?: string;
    Preferred_Email__c?: string;
    Preferred_Language__c?: string;
    Primary_Role__c?: string;
    Risks_or_Sensitivities__c?: string;
    Sector__c?: string;
    Source_of_Contact_Creation__c?: string;
    State_Department_Province_of_Interest__c?: string;
    Suffix__c?: string;
    Title__c?: string;
    Topics_of_Interest__c?: string;
    Work_Email__c?: string;
}
