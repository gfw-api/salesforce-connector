import config from 'config';
import jsforce from 'jsforce';
import logger from 'logger';

async function main() {
    const url: string = config.get('salesforce.url');
    const username: string = config.get('salesforce.username');
    const password: string = config.get('salesforce.password');

    if (!url || !username || !password) {
        throw new Error('Not all connection environment variables are present.');
    }

    const conn = new jsforce.Connection({ loginUrl : url });

    // @ts-ignore
    logger.info('connecting');

    const userInfo = await conn.login(username, password);

    logger.info('connected');
    // Now you can get the access token and instance URL information.
    // Save them to establish connection next time.
    logger.info(conn.accessToken);
    logger.info(conn.instanceUrl);
    // logged in user property
    logger.info("User ID: " + userInfo.id);
    logger.info("Org ID: " + userInfo.organizationId);
}

main().then(() => logger.info('terminating')).catch(err => logger.info(err));
