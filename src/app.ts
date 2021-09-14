import { Server } from 'http';
import Koa from 'koa';
import koaLogger from 'koa-logger';
import { RWAPIMicroservice } from 'rw-api-microservice-node';
// @ts-ignore
import koaSimpleHealthCheck from 'koa-simple-healthcheck';

import logger from 'logger';
import SalesforceRouter from 'routes/salesforce.router';
import ErrorSerializer from 'serializers/error.serializer';

interface IInit {
    server: Server;
    app: Koa;
}

const init: () => Promise<IInit> = async (): Promise<IInit> => {
    return new Promise((resolve) => {
        const app: Koa = new Koa();

        app.use(koaSimpleHealthCheck());

        app.use(async (ctx: { status: number; response: { type: string; }; body: any; }, next: () => any) => {
            try {
                await next();
            } catch (error) {

                ctx.status = error.status || 500;

                if (ctx.status >= 500) {
                    logger.error(error);
                } else {
                    logger.info(error);
                }

                if (process.env.NODE_ENV === 'prod' && ctx.status === 500) {
                    ctx.response.type = 'application/vnd.api+json';
                    ctx.body = ErrorSerializer.serializeError(ctx.status, 'Unexpected error');
                    return;
                }

                ctx.response.type = 'application/vnd.api+json';
                ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
            }
        });

        app.use(RWAPIMicroservice.bootstrap({
            logger,
            gatewayURL: process.env.GATEWAY_URL,
            microserviceToken: process.env.MICROSERVICE_TOKEN,
            fastlyEnabled: process.env.FASTLY_ENABLED as boolean | 'true' | 'false',
            fastlyServiceId: process.env.FASTLY_SERVICEID,
            fastlyAPIKey: process.env.FASTLY_APIKEY
        }));

        app.use(koaLogger());

        app.use(SalesforceRouter.middleware());

        const port: string = process.env.PORT || '9500';

        const server: Server = app.listen(port);

        logger.info('Server started in port', port);
        resolve({ app, server });
    });
};

export { init };
