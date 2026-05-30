const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(  
    {
    chatId:{ type: mongoose.Schema.Types.ObjectId, 
        ref: "Chat", 
        required: true
     },
   sender: { type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true
 },

    content: { type: String,
        trim: true,
        },
        type: { type: String,
            enum: ["text", "image", "file"],
            default: "text",
        },
       mediaUrl: {
    type: String,   // signed Cloudinary URL
},
mediaPublicId: {
    type: String,   // to regenerate signed URL when expired
},
mediaName: {
    type: String,   // original filename shown in chat
},
        status:{
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent",

        },
        readBy:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);