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
            loggedUser: Joi.object().optional(),
            countryOfInterest: Joi.string().optional().max(100),
            email: Joi.string().required().max(100),
            firstName: Joi.string().optional().max(50),
            lastName: Joi.string().optional().max(80),
            primaryRole: Joi.string().optional().max(100),
            primaryRoleOther: Joi.string().optional().max(50),
            sector: Joi.string().optional().max(100),
            areaOrRegionOfInterest: Joi.string().optional().max(100),
            title: Joi.string().optional().max(80),
            organizationName: Joi.string().optional().max(100),
            topicsOfInterest: Joi.string().optional().max(100),
            userCity: Joi.string().optional().max(100),
            userState: Joi.string().optional().max(100),
            userCountry: Joi.string().optional().max(100),
            howDoYouUseGFW: Joi.string().optional().max(50),
            signUpForTesting: Joi.string().optional().max(50),
            sourceOfContactCreation: Joi.string().optional().max(100)
        }
    }
};

const searchContactConfig: Config = {
    validate: {
        query: {
            loggedUser: Joi.optional(),
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
        ctx.body = SalesForceSerializer.serialize([contact]);
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
