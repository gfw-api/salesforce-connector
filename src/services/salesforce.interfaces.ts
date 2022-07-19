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
export interface SFContact extends SFContactResponse {
    External_Id__c: string | null;
}

export interface SFDataImportRecord {
    Potential_Individual_ID__c?: string;
    Country_of_Interest__c?: string;
    Email__c?: string;
    First_Name__c?: string;
    Last_Name__c?: string;
    Primary_Role__c?: string;
    Primary_Role_Other__c?: string;
    Sector__c?: string;
    Area_or_Region_of_Interest__c?: string;
    Title__c?: string;
    Account_Name__c?: string;
    Topics_of_Interest__c?: string;
    Mailing_City__c?: string;
    Mailing_State_Province__c?: string;
    Mailing_Country__c?: string;
    How_do_you_use_GFW__c?: string;
    How_do_you_use_GFW_Other__c?: string;
    GFW_New_Feature_Opt_In__c?: string;
    Source_of_Contact_Creation__c?: string;
}
