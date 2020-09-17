const mockRequest = (reqHeader, sessionData) => ({
    get(name) {
        if (name === 'authorization') {
            return reqHeader;
        } else {
            return null;
        }
    },
    userData: { email: sessionData },
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const checkAuth = require('./check-auth');

describe('headerAuthMiddleware', () => {
    test('should set req.userData if API key is in authorization and is valid', async () => {
        const req = mockRequest('rS)Td:>08Z}E?>6_x(}sX|DpdJms/Wf6Aw#lI0$^gH`$p,*h#p:vjjfSq,pDd]h', 'test@test.com');
        const res = mockResponse();
        await checkAuth(req, res, () => {});

        expect(req.userData.email).toEqual('test@test.com');
    });

    test('should 401 if authorization header is not present', async () => {
        const req = mockRequest(undefined);
        const res = mockResponse();
        await checkAuth(req, res, () => {});

        expect(req.userData.email).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should 401 if API key is in authorization but invalid', async () => {
        const req = mockRequest('fake-api-key');
        const res = mockResponse();
        await checkAuth(req, res, () => {});

        expect(req.userData.email).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(401);
    });
});