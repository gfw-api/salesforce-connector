import { SinonSandbox, SinonStub } from 'sinon';
import { Connection } from 'jsforce';
import * as mod from 'services/salesforce-connection.service';

export interface JSForceStubResponse {
    loginStub: SinonStub;
    sobjectStub: SinonStub;
    methodStubs: Record<string, SinonStub>;
}

export function stubJSForce(sandbox: SinonSandbox, methodMap: Record<string, any>): JSForceStubResponse {
    const methodStubs: Record<string, SinonStub> = {};

    for (const [key, value] of Object.entries(methodMap)) {
        if (value instanceof Error){
            methodStubs[key] = sandbox.stub().throws(value);
        } else {
            methodStubs[key] = sandbox.stub().resolves(value);

        }

    }

    const loginStub: SinonStub = sandbox.stub().resolves(null);
    const sobjectStub: SinonStub = sandbox.stub().returns(methodStubs);

    sandbox.stub(mod, 'connect').resolves({
        login: loginStub,
        sobject: sobjectStub,
    } as unknown as Connection);

    return { loginStub, sobjectStub, methodStubs };
}
