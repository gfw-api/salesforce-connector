import { Connection } from 'jsforce';
import logger from 'logger';

import ContactNotFoundError from 'errors/contact-not-found.error';
import { SFContact, SFDataImportRecord } from 'services/salesforce.interfaces';

import { connect } from './salesforce-connection.service';
import InsertFailedError from '../errors/insert-failed.error';
import InvalidPropertyError from '../errors/invalid-property.error';

const SF_DATA_IMPORT_RECORD_FIELD_MAP: Record<string, any> = {
    countryOfInterest: 'Country_of_Interest__c',
    email: 'Email__c',
    firstName: 'First_Name__c',
    lastName: 'Last_Name__c',
    primaryRole: 'Primary_Role__c',
    primaryRoleOther: 'Primary_Role_Other__c',
    sector: 'Sector__c',
    areaOrRegionOfInterest: 'Area_or_Region_of_Interest__c',
    title: 'Title__c',
    organizationName: 'Account_Name__c',
    topicsOfInterest: 'Topics_of_Interest__c',
    userCity: 'Mailing_City__c',
    userState: 'Mailing_State_Province__c',
    userCountry: 'Mailing_Country__c',
    howDoYouUseGFW: 'How_do_you_use_GFW__c',
    howDoYouUseGFWOther: 'How_do_you_use_GFW_Other__c',
    signUpForTesting: 'GFW_New_Feature_Opt_In__c',
    sourceOfContactCreation: 'Source_of_Contact_Creation__c',
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
            newDataImportRecord.Email__c = body.email;
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
            } else if (key === 'email' || key === 'loggedUser') {
                // email will be present, and it should be silently dropped.
                // loggedUser is internal, and should be silently dropped.
            } else {
                throw new InvalidPropertyError(`Property ${key} could not be mapped to a valid field.`);
            }
        }

        return dataImportRecord;
    }
}
