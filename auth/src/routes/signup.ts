import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest } from '@yctickets123/common';

import { User } from '../models/user';
import { BadRequestError } from '@yctickets123/common';

const router = express.Router();

router.post('/api/users/signup',[
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage('Password must be between 4 and 20 characters')
], validateRequest, 
    async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //apakah email dan password yang disupply sudah dipakai user lain?
    const existingUser = await User.findOne({ email })
    //kalau sudah, generate error
    if (existingUser) {
        // console.log('Email in use');
        throw new BadRequestError('Email in use');
    }

    //kalau belum, bikin user baru
    const user = User.build({ email, password });
    await user.save();

    //create jwt
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!);

    //store in session object
    req.session = {
        jwt: userJwt,
    };

    
    res.status(201).send(user);
})  

export { router as signupRouter };