import config from 'config';
import jsforce, {Connection} from 'jsforce';
import logger from 'logger';

let currentConnection: Connection;

async function createConnection() {
    logger.info('[SalesforceService] Initializing SF service...');

    const url: string = config.get('salesforce.url');
    const username: string = config.get('salesforce.username');
    const password: string = config.get('salesforce.password');

    if (!url || !username || !password) {
        throw new Error('Not all SF connection env variables are present.');
    }

    currentConnection = new jsforce.Connection({ loginUrl: url });
    await currentConnection.login(username, password);
    logger.info('[SalesforceService] Connection to SF successful');
}

export async function connect() {
    if(!currentConnection) {
        await createConnection();
    }

    return currentConnection;
}
