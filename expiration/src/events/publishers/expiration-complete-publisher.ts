import { ExpirationCompleteEvent, Publisher, Subjects } from "@yctickets123/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}