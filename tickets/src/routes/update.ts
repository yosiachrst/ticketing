import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, NotFoundError, requireAuth, NotAuthorizedError, BadRequestError } from '@yctickets123/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth, [
    body('title')
        .notEmpty()
        .withMessage('Title is required'),
    body('price')
        .notEmpty()
        .isFloat({gt: 0})
        .withMessage('Price is invalid'),    
], validateRequest, async(req: Request, res: Response) => {
    const selectedTicket = await Ticket.findById(req.params.id);
    if (!selectedTicket) {
        throw new NotFoundError();
    }

    if (selectedTicket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    } 

    if (selectedTicket.orderId) {
        throw new BadRequestError('Cannot edit a reserved ticket');
    }

    selectedTicket.set({title: req.body.title, price: req.body.price});
    await selectedTicket.save();

    const ticketPublisher = new TicketUpdatedPublisher(natsWrapper.client);
    await ticketPublisher.publish({
        id: selectedTicket.id,
        title: selectedTicket.title,
        price: selectedTicket.price,
        userId: selectedTicket.userId,
        version: selectedTicket.version
    })

    return res.send(selectedTicket);
});

export { router as updateTicketRouter };