import express, {
    Request,
    Response
} from 'express';
import {
    body,
    validationResult
} from 'express-validator';
import {
    ValidationChain
} from 'express-validator/src/chain';

import UserController from '../../../controllers/UserController';

import errorResponseHandler from '../../../utils/errorResponseHandler';
import validationResponseHandle from '../../../utils/validationResponseHandler';

import RateLimiter from '../../RateLimiter';

const userController = new UserController();

const rateLimiter = new RateLimiter();
const router = express.Router();

const inputValidations: ValidationChain[] = [
    body('emailAddress').trim().isEmail().normalizeEmail()
        .not()
];

router.post('/invite-user', [
    rateLimiter.limited,
    ...inputValidations
], async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        const errorMessagesList = validationResponseHandle(errors.array());

        return response.status(422).send(errorMessagesList);
    }

    try {
        const {
            body: {
                emailAddress
            }
        } = request;

        await userController.inviteUser(emailAddress);

        return response.sendStatus(201);
    } catch (error) {
        return errorResponseHandler(error, response);
    }
});

export default router;