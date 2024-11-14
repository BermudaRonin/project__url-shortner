import mongoose from "mongoose";

const schema = new mongoose.Schema({
    url: { type: String, required: true, trim: true },
    short: { type: String, trim: true },
    code: { type: String, trim: true, unique: true, index: true },
    clicks: { type: Number, default: 0, required: true },
    expires_at: { type: Date }
}, {
    timestamps: true
});

// Auto delete expired

schema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });


const model = mongoose.model("url", schema);

export default model;   
