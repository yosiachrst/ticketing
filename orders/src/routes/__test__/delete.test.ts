import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it ('marks an order as cancelled', async() => {
    const cookie1 = signin();

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concerto',
        price: 50
    });
    ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie1)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie1)
        .expect(204);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emits an order cancelled event', async() => {
    const cookie1 = signin();

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concerto',
        price: 50
    });
    ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie1)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie1)
        .expect(204);

    const updatedOrder = await Order.findById(order.id);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});