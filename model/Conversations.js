const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "partner",
        },
        chat: [
            {
                user: {
                    type: String,

                },
                partner: {
                    type: String,
                }
            }
        ]
}, {
    timestamps: true,
});

module.exports = mongoose.model("chat", ChatSchema);
