import request from "supertest";
import { app } from "../../app";
import mongoose from 'mongoose';

it ('returns a 404 if a ticket is not found', async() => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404);
});

it ('returns a ticket if a ticket is found', async() => {
    const title = 'Yosia Ganteng';
    const price = 9999;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title,
            price
        })
        .expect(201);
    
    const fetchedResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(fetchedResponse.body.title).toEqual(title);
    expect(fetchedResponse.body.price).toEqual(price);
})