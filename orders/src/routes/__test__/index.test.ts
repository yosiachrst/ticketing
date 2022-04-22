import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async (title: string, price: number) => {
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title, price
    })
    ticket.save();

    return ticket;
}

it('fetches orders for a particular user', async() => {
    // Create 2 cookies to represent 2 user
    const cookie1 = signin();
    const cookie2 = signin();

    // Create three tickets
    const ticket1 = await buildTicket('concert 1', 20);
    const ticket2 = await buildTicket('concert 2', 50);
    const ticket3 = await buildTicket('concert 3', 100);

    // Create one order as User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie1)
        .send({
            ticketId: ticket1.id,
        })
        .expect(201);

    // Create two orders as User #2
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie2)
        .send({
            ticketId: ticket2.id,
        })
        .expect(201);

    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie2)
        .send({
            ticketId: ticket3.id,
        })
        .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie2)
        .send()
        .expect(200);

    // Expectations: Make sure we only got the orders for User #2
    expect(response.body[0].ticket.id).toEqual(ticket2.id);
    expect(response.body[1].ticket.id).toEqual(ticket3.id);
})