import { Publisher, Subjects, TicketUpdatedEvent } from "@yctickets123/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
