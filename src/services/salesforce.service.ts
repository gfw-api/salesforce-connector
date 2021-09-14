import { Connection } from 'jsforce';
import logger from 'logger';

import ContactNotFoundError from 'errors/contact-not-found.error';
import { SFContact, SFDataImportRecord } from 'services/salesforce.interfaces';

import { connect } from './salesforce-connection.service';
import InsertFailedError from '../errors/insert-failed.error';
import InvalidPropertyError from '../errors/invalid-property.error';
import NoPropertiesError from '../errors/no-properties.error';

const SF_DATA_IMPORT_RECORD_FIELD_MAP: Record<string, any> = {
    accountName: 'Account_Name__c',
    alternateEmail: 'Alternate_Email__c',
    assistant: 'Assistant__c',
    assistantEmailAddress: 'Assistant_Email_Address__c',
    asstPhone: 'Asst_Phone__c',
    cityOfInterest: 'City_of_Interest__c',
    collabSummary: 'Collab_Summary__c',
    communityMemberType: 'Community_Member_Type__c',
    countryOfInterest: 'Country_of_Interest__c',
    department: 'Department__c',
    firstName: 'First_Name__c',
    geographicRegion: 'Geographic_Region__c',
    gfwContactType: 'GFW_Contact_Type__c',
    gradeLevel: 'Grade_Level__c',
    importedAccount: 'Imported_Account__c',
    importedContact: 'Imported_Contact__c',
    invalidEmailAddress: 'Invalid_Email_Address__c',
    lastName: 'Last_Name__c',
    nickname: 'Nickname__c',
    partnerType: 'Partner_Type__c',
    personalEmail: 'Personal_Email__c',
    preferredEmail: 'Preferred_Email__c',
    preferredLanguage: 'Preferred_Language__c',
    primaryRole: 'Primary_Role__c',
    risksOrSensitivities: 'Risks_or_Sensitivities__c',
    sector: 'Sector__c',
    sourceOfContactCreation: 'Source_of_Contact_Creation__c',
    stateDepartmentProvinceOfInterest: 'State_Department_Province_of_Interest__c',
    suffix: 'Suffix__c',
    title: 'Title__c',
    topicsOfInterest: 'Topics_of_Interest__c',
    workEmail: 'Work_Email__c',
};


export default class SalesforceService {
    static async findContactByEmail(search: string): Promise<SFContact> {
        const connection: Connection = await connect();
        const results: SFContact[] = await connection.sobject('Contact').find({
            $or: [
                { Email: { $like: search } },
                { Personal_Email__c: { $like: search } },
                { Work_Email__c: { $like: search } },
                { Alternate_Email__c: { $like: search } },
            ]
        });

        if (!results || !results[0]) {
            throw new ContactNotFoundError();
        }

        if (results.length > 1) {
            logger.warn(`[SalesforceService - findContactByEmail] Found ${results.length} contacts`);
        }

        return results[0];
    }

    static async logContactAction(email: string, body: Record<string, any>): Promise<void> {
        const connection: Connection = await connect();

        const newDataImportRecord: SFDataImportRecord = SalesforceService.bodyToSFDataImportRecord(body);

        try {
            const contact: SFContact = await SalesforceService.findContactByEmail(email);
            newDataImportRecord.Potential_Individual_ID__c = contact.External_Id__c;
        } catch (error) {
            if (!(error instanceof ContactNotFoundError)) {
                throw error;
            }
            newDataImportRecord.Email = body.email;
        }

        let insertResult: any;

        try {
            insertResult = await connection.sobject('Data_Import_Record__c').create([
                newDataImportRecord
            ]);
        } catch (error) {
            throw error;
        }

        if (insertResult[0].success === false) {
            const errorDetail: Record<string, any> = insertResult[0].errors[0];
            if (errorDetail.statusCode === 'INVALID_FIELD') {
                // throw new InsertFailedError(`Field "${fieldName}" does not exist.`);
            }
            throw new InsertFailedError(insertResult[0].errors[0].message);
        }
    }

    static bodyToSFDataImportRecord(body: Record<string, any>): SFDataImportRecord {
        const dataImportRecord: SFDataImportRecord = {};

        for (const [key, value] of Object.entries(body)) {
            if (key in SF_DATA_IMPORT_RECORD_FIELD_MAP) {
                dataImportRecord[SF_DATA_IMPORT_RECORD_FIELD_MAP[key] as keyof SFDataImportRecord] = value;
            } else if (key === 'email') {
                // email will be present, and it should be silently dropped.
            } else {
                throw new InvalidPropertyError(`Property ${key} could not be mapped to a valid field.`);
            }
        }

        if (Object.keys(dataImportRecord).length === 0) {
            throw new NoPropertiesError();
        }

        return dataImportRecord;
    }
}
