import { Context, DefaultState } from 'koa';
import Router from 'koa-router';
import logger from 'logger';

import SalesforceService from 'services/salesforce.service';
import { SFContact } from 'services/salesforce.interfaces';
import SalesForceSerializer from 'serializers/salesforce.serializer';
import ContactNotFoundError from 'errors/contact-not-found.error';

const router: Router = new Router<DefaultState, Context>({ prefix: '/v1/salesforce' });

router.get('/contact/:search', async (ctx: Context): Promise<void> => {
    logger.info('[SalesforceConnector] - Find SF contact by email or last name: ', ctx.params.search);

    try {
        const contact: SFContact = await SalesforceService.findContactByEmailOrLastName(ctx.params.search);
        ctx.body = { data: SalesForceSerializer.serializeContact(contact) };
    } catch (err) {
        if (err instanceof ContactNotFoundError) {
            return ctx.throw(404, 'Contact not found');
        }

        logger.error(err);
        return ctx.throw(500, 'Internal server error');
    }

});

export default router;
