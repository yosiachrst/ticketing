import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@yctickets123/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_SECONDS = 15*60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .notEmpty()
        .withMessage('ticketId must be provided')    
], validateRequest, async(req: Request, res: Response) => {
    const { ticketId } = req.body;

    //Find the ticket the user is trying to order in the database
    const selectedTicket = await Ticket.findById(ticketId);
    if (!selectedTicket) {
        throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    const isReserved = await selectedTicket.isReserved();

    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved.'); 
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_SECONDS);

    // Build the order and save it to database
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: selectedTicket
    });

    await order.save();

    // Publish an event saying that an order was created
    const orderPublisher = new OrderCreatedPublisher(natsWrapper.client);
    orderPublisher.publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        version: order.version,
        ticket: {
            id: order.ticket.id,
            price: order.ticket.price
        }
    })

    res.status(201).send(order);
});

export { router as createOrderRouter };