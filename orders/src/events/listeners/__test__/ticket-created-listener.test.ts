import { TicketCreatedEvent } from "@yctickets123/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";

const setup = async() => {
    // create an instance of a listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // create a fake data event object
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
}

it('creates and saves a ticket and acks', async() => {
    const { listener, data, msg } = await setup();
    // call onMessage func with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async() => {
    const { listener, data, msg } = await setup();
    // call onMessage func with the data object + message object
    await listener.onMessage(data, msg);
    // write assertions to make sure ack is called.
    expect(msg.ack).toHaveBeenCalled();
});