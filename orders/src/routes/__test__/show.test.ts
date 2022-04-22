import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";

it('fetches the order', async() => {
    const cookie1 = signin();

    // Create a ticket
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert', 
        price: 20
    })
    ticket.save();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie1)
        .send({
            ticketId: ticket.id,
        })
        .expect(201)
    
    // Make request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', cookie1)
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
})

it('returns an unauthorized error if one user tries to fetch another users order', async() => {
    const cookie1 = signin();

    // Create a ticket
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert', 
        price: 20
    })
    ticket.save();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie1)
        .send({
            ticketId: ticket.id,
        })
        .expect(201)
    
    // Make request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', signin())
        .expect(401);

})