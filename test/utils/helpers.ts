import nock from 'nock';

export const mockGetUserFromToken: (userProfile:Record<string,any>) => void = (userProfile: Record<string, any>) => {
    nock(process.env.GATEWAY_URL, { reqheaders: { authorization: 'Bearer abcd' } })
        .get('/auth/user/me')
        .reply(200, userProfile);
};
