import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { natsWrapper } from '../nats-wrapper'

declare global {
    function signin(): string[];
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';

    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
})

global.signin = () => {  
    const id = new mongoose.Types.ObjectId().toHexString();
    const email = 'test@test.com';

    //build a JWT payload
    const userJwt = jwt.sign({
        id, email
    }, process.env.JWT_KEY!);
    
    //build session object
    const session = {jwt: userJwt};

    //build session json object
    const sessionJSON = JSON.stringify(session);

    //encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');
    
    return [`session=${base64}`];
}