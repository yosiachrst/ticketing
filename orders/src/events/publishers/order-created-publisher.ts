import { Publisher, OrderCreatedEvent, Subjects } from "@yctickets123/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

