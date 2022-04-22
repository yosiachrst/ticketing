import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@yctickets123/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";

const setup = async() => {
    // Create a listener 
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save the ticket 
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    // tiap ticket.save(), version + 1. karna awal baru dibuat
    // ticket.save() bikin version = 0, jadi data dibawah dibuat 
    // pake version + 1 (seolah-olah ada update dulu)
    await ticket.save();
    //await ticket.save();
    console.log("ver:", ticket.version);
 
    // Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'new concert',
        version: ticket.version + 1,
        price: 9999,
        userId: 'asdsad'
    }

    // Create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    // return all of this stuff
    return { msg, data, ticket, listener };
}

it('finds, updates, and saves a ticket', async() => {
    const { msg, data, ticket, listener } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async() => {
    const { msg, data, listener } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it ('does not call ack if events has skipped version', async() => {
    const { msg, data, listener, ticket } = await setup();

    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    } catch(err) {

    }

    expect(msg.ack).not.toHaveBeenCalled();
})