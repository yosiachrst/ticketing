import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validateRequest } from '@yctickets123/common';
import { body } from 'express-validator';
import { BadRequestError } from '@yctickets123/common';
import { User } from '../models/user';
import { Password } from '../services/password';
const router = express.Router();

router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid.'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password.')
    ], 
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }
        const isSame: boolean = await Password.compare(existingUser.password, password);
        if (isSame) {
            const userJwt = jwt.sign({
                id: existingUser.id,
                email: existingUser.email
            }, process.env.JWT_KEY!);
        
            //store in session object
            req.session = {
                jwt: userJwt,
            };
        }
        else {
            throw new BadRequestError('Invalid credentials');
        }

        res.status(200).send(existingUser);
})  

export { router as signinRouter };