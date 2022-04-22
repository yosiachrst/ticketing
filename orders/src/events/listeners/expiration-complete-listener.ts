import { ExpirationCompleteEvent, Listener, Subjects } from "@yctickets123/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order, OrderStatus } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName: string = queueGroupName
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        // Find the order
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new Error('Order not found');
        }
        
        // Set the status to cancelled

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }
        
        order.set({status: OrderStatus.Cancelled});
        await order.save();
        
        // Publish order cancelled event
        new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            }
        });

        // Ack the message
        msg.ack();
    }
    
}