import { NotFoundError } from '@yctickets123/common';
import express, { Request, Response} from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        throw new NotFoundError();
    }

    res.send(ticket).status(200);
});

export { router as showTicketRouter }