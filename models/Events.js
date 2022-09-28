const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema(
    {
        createdAt: Date,
        updatedAt: Date,
        commId: mongoose.Schema.Types.ObjectId,
        commName: String,
        name: String,
        description: String,
        location: String,
        startDate: Date,
        endDate: Date,
        address: {
            name: String,
            city: String,
            pincode: String,
            state: String,
            country: String,
        },
        type: {
            type: String,
            enum: ['ONLINE', 'OFFLINE'],
        },
        likesCount: Number,
        commentsCount: Number,
    },
    { timestamps: true }
);
const Events = mongoose.model('events', eventSchema);
module.exports = Events;
