const mockRequest = (reqHeader, sessionData) => ({
    get(name) {
        if (name === 'authorization') {
            return reqHeader;
        } else {
            return null;
        }
    },
    userData: { admin: sessionData },
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const checkRole = require('./check-role');

describe('headerRoleMiddleware', () => {
    test('should set req.session.admin as true if API key is old by an admin', async () => {
        const req = mockRequest('rS)Td:>08Z}E?>6_x(}sX|DpdJms/Wf6Aw#lI0$^gH`$p,*h#p:vjjfSq,pDd]h',  true);
        const res = mockResponse();
        await checkRole(req, res, () => {});

        expect(req.userData.admin).toEqual(true);
    });

    test('should set req.session.admin as false and send 401 if API key isn\'t old by and admin', async () => {
        const req = mockRequest('rS)Td:>08Z}E?>6_x(}sX|DpdJms/Wf6Aw#lI0$^gH`$p,*h#p:vjjfSq,pDd]h', false);
        const res = mockResponse();
        await checkRole(req, res, () => {});

        expect(req.userData.admin).toEqual(false);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});