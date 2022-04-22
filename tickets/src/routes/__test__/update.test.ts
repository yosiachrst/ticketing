import request from "supertest";
import { app } from "../../app";
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from "../../models/ticket";

it ('returns a 404 if a provided id is not exists', async() => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', signin())
        .send({
            title: 'asdsda',
            price: 10
        })
        .expect(404);
});

it ('returns a 401 if an user is prohibited (not authorized)', async() => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'asdsda',
            price: 10
        })
        .expect(401);
});

it ('returns a 401 does not own a ticket', async() => {
    const initTitle = 'asdkasdk';
    const initPrice = 20;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: initTitle,
            price: initPrice,
        })
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', signin())
        .send({
            title: 'zxcasd', 
            price: 30
        })
        .expect(401);
    
    expect(response.body.title).toEqual(initTitle);
    expect(response.body.price).toEqual(initPrice);
});

it ('returns a 400 if a user provides an invalid title or price', async() => {
    const initTitle = 'asdkasdk';
    const initPrice = 20;
    const cookie = signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: initTitle,
            price: initPrice,
        })
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: initPrice
        })
        .expect(400);

        await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: initTitle,
            price: -20
        })
        .expect(400);
});

it ('updates a ticket if provided a valid parameters', async() => {
    const cookie = signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdasd',
            price: 20,
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Yey!',
            price: 30,
        })
        .expect(200);
    
    const ticket = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();
    
    expect(ticket.body.title).toEqual('Yey!');
    expect(ticket.body.price).toEqual(30);
});

it('publishes an event', async() => {
    const cookie = signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdasd',
            price: 20,
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Yey!',
            price: 30,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('rejects updates if ticket is reserved', async() => {
    const cookie = signin();
    const orderId = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdasd',
            price: 20,
        });
    
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId });
    await ticket!.save();

    const response1 = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Yey!',
            price: 30,
        })
        .expect(400);
})