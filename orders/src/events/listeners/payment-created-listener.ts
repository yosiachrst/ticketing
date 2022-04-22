import { Subjects, Listener, PaymentCreatedEvent } from '@yctickets123/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order, OrderStatus } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName: string = queueGroupName
    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        // find the order that has been paid.
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({
            status: OrderStatus.Complete,
        })
        await order.save();

        msg.ack();
    }
    
}