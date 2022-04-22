import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// An interface that describes the properties 
// that are required to create a new Ticket
interface TicketAttrs {
    id: string,
    title: string,
    price: number,
}

// An interface that describes the properties
// that a ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(data: { id: string, version: number }): Promise<TicketDoc | null>;
}

// An interface that describes the properties
// that a ticket document has
// If we has any extra properties, list them here
export interface TicketDoc extends mongoose.Document {
    title: string,
    price: number,
    version: number,
    isReserved(): Promise<boolean>,
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
}, {
    toJSON: {
        transform (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
})

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price,
    });
}

ticketSchema.statics.findByEvent = async (data: { id: string, version: number}): Promise<TicketDoc | null> => {
    return Ticket.findOne({
        _id: data.id,
        version: data.version - 1
    });
}

ticketSchema.methods.isReserved = async function() {
    //this === ticket yg di select dan di call isReserved nantinya
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
export { Ticket }