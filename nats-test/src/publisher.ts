import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const client = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

client.on('connect', async () => {
    console.log('Publisher connected to NATS');

    const ticketPublisher = new TicketCreatedPublisher(client);
    await ticketPublisher.publish({
        id: '123',
        title: 'concert',
        price: 20
    })
    // ini ngetes aja, Promisenya jgn Promise<void> ya.
    /*.then((value) => {
        console.log(value);
    })*/
})