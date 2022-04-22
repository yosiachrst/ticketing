import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title, price
        })
        .expect(201);
}  

it('can fetch a list of tickets', async() => {
    await createTicket('asd', 30);
    await createTicket('bcd', 20);

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);
    
    expect(response.body.length).toEqual(2);
})