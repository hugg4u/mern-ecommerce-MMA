import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const bannerSchema = new mongoose.Schema(
    {
        bid: {
            type: String,
            default: uuidv4,
            unique: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        },
        deleted: {
            type: Boolean,
            required: true,
            default: false
        },
    },
    {
        versionKey: '__v',
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
)

const Banner = mongoose.model('Banner', bannerSchema)
export default Banner 