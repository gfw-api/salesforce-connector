import { SinonSandbox, SinonStub } from 'sinon';
import { Connection } from 'jsforce';

import { SFContact } from 'services/salesforce.interfaces';
import * as mod from 'services/salesforce-connection.service';

export interface JSForceStubResponse {
    findStub: SinonStub;
    loginStub: SinonStub;
    sobjectStub: SinonStub;
}

export function stubJSForce(sandbox: SinonSandbox, findReturns: SFContact[] = null): JSForceStubResponse {
    const findStub: SinonStub = sandbox.stub().resolves(findReturns);
    const loginStub: SinonStub = sandbox.stub().resolves(null);
    const sobjectStub: SinonStub = sandbox.stub().returns({ find: findStub });

    sandbox.stub(mod, 'connect').resolves({
        login: loginStub,
        sobject: sobjectStub,
    } as unknown as Connection);

    return { findStub, loginStub, sobjectStub };
}
