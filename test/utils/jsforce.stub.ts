import { SinonSandbox } from 'sinon';
import { Connection } from 'jsforce';

import { SFContact } from 'services/salesforce.interfaces';

import * as mod from "services/salesforce-connection.service";

export function stubJSForce(sandbox: SinonSandbox, findReturns: SFContact[] = null) {
    sandbox.stub(mod, 'connect').usingPromise(Promise).resolves({
        login: () => new Promise(resolve => { return resolve(null); }),
        sobject: sandbox.stub().returns({
            find: () => findReturns,
        }),
    } as unknown as Connection);
}
