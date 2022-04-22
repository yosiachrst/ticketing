import { Publisher, Subjects, TicketCreatedEvent } from "@yctickets123/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
