import { Context, DefaultState } from 'koa';
import Router from 'koa-router';

import logger from 'logger';

const router: Router = new Router<DefaultState, Context>({ prefix: '/salesforce' });

router.get('/user/:email', async (ctx: Context): Promise<void> => {
    logger.info('[SalesforceConnector] - Get User by email: ', ctx.params.email);

    // const user: IUser = await OktaService.getUserById(ctx.params.id);

    // if (!user) {
    //     ctx.throw(404, 'User not found');
    //     return;
    // }
    //
    // ctx.body = user;
});

export default router;
