import { requireAuth, validateRequest } from "@yctickets123/common";
import express, {Request, Response} from "express";
import { body } from "express-validator";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";

import { Ticket } from "../models/ticket";

const router = express.Router();

router.post('/api/tickets', requireAuth, [
    body('title')
        .notEmpty()
        .withMessage('Title is required'),
    body('price')
        .notEmpty()
        .isFloat({gt: 0})
        .withMessage('Price is invalid'),
], validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({title, price, userId: req.currentUser!.id});

    await ticket.save();

    const ticketPublisher = new TicketCreatedPublisher(natsWrapper.client);
    
    await ticketPublisher.publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    })

    res.status(201).send(ticket);
});

export { router as createTicketRouter };