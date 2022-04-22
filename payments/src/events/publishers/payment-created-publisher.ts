import { Subjects, Publisher, PaymentCreatedEvent } from '@yctickets123/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}