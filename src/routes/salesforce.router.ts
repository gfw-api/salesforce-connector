import { Context } from 'koa';
import router, { Config, Router } from 'koa-joi-router';
import logger from 'logger';

import SalesforceService from 'services/salesforce.service';
import { SFContact } from 'services/salesforce.interfaces';
import SalesForceSerializer from 'serializers/salesforce.serializer';
import ContactNotFoundError from 'errors/contact-not-found.error';

const Joi: typeof router.Joi = router.Joi;

const sfRouter: Router = router();
sfRouter.prefix('/api/v1/salesforce');

const updateContactConfig: Config = {
    validate: {
        type: 'json',
        body: {
            accountName: Joi.string().optional().max(80),
            cityOfInterest: Joi.string().optional().max(100),
            collabSummary: Joi.string().optional().max(255),
            communityMemberType: Joi.string().optional().max(100),
            countryOfInterest: Joi.string().optional().max(100),
            email: Joi.string().required().max(100),
            gfwContactType: Joi.string().optional().max(50),
            firstName: Joi.string().optional().max(50),
            lastName: Joi.string().optional().max(80),
            partnerType: Joi.string().optional().max(100),
            preferredLanguage: Joi.string().optional().max(100),
            primaryRole: Joi.string().optional().max(100),
            sector: Joi.string().optional().max(100),
            sourceOfContactCreation: Joi.string().optional().max(100),
            stateDepartmentProvinceOfInterest: Joi.string().optional().max(100),
            title: Joi.string().optional().max(80),
            topicsOfInterest: Joi.string().optional().max(100),
        }
    }
};

const searchContactConfig: Config = {
    validate: {
        query: {
            email: Joi.string().required().max(100),
        }
    }
};


const logAction: (ctx: Context) => Promise<void> = async (ctx: Context): Promise<void> => {
    logger.info('[SalesforceConnector] - Log SF contact action');

    const { email } = ctx.request.body;

    try {
        await SalesforceService.logContactAction(email, ctx.request.body);
    } catch (err) {
        if (err instanceof ContactNotFoundError) {
            return ctx.throw(404, 'Contact not found');
        }

        return ctx.throw(err);
    }
    ctx.response.status = 201;
};

const searchContact: (ctx: Context) => Promise<void> = async (ctx: Context): Promise<void> => {
    logger.info('[SalesforceConnector] - Find SF contact by email: ', ctx.params.search);

    try {
        const contact: SFContact = await SalesforceService.findContactByEmail(ctx.query.email as string);
        ctx.body = SalesForceSerializer.serialize(contact);
    } catch (err) {
        if (err instanceof ContactNotFoundError) {
            return ctx.throw(404, 'Contact not found');
        }

        logger.error(err);
        return ctx.throw(500, 'Internal server error');
    }
};

sfRouter.post('/contact/log-action', updateContactConfig, logAction);
sfRouter.get('/contact/search', searchContactConfig, searchContact);

export default sfRouter;
