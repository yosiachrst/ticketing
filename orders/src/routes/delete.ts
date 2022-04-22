import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@yctickets123/common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async(req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    const orderPublisher = new OrderCancelledPublisher(natsWrapper.client);
    orderPublisher.publish({
        id: order.id,
        version: order.version,
        ticket: order.ticket.id
    })

    res.status(204).send(order);
});

export { router as deleteOrderRouter };