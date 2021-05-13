import chai from 'chai';
import nock from 'nock';
import ChaiHttp from 'chai-http';

let requester:ChaiHttp.Agent;

chai.use(ChaiHttp);

export const getTestAgent: (forceNew?: boolean) => Promise<ChaiHttp.Agent> = async (forceNew = false) => {
    if (forceNew && requester) {
        await new Promise((resolve) => {
            requester.close(() => {
                requester = null;
                resolve(null);
            });
        });
    }

    if (requester) {
        return requester;
    }

    if (process.env.CT_REGISTER_MODE === 'auto') {
        nock(process.env.CT_URL)
            .post(`/api/v1/microservice`)
            .reply(200);
    }

    const { init } = await import('app');
    const { server } = await init();

    requester = chai.request.agent(server);

    return requester;
};

export const closeTestAgent: () => Promise<void> = async () => {
    if (!requester) {
        return;
    }
    requester.close();

    requester = null;
};
