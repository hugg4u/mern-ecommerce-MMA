import mongoose from "mongoose";
import vietnameseProvinces from "../Utils/Constants/Address/Provinces.js";
import vietnameseDistricts from "../Utils/Constants/Address/District.js";

const addressSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique:true
        },
        district: {
            type: String,
            enum: vietnameseDistricts,
            required: true,
            lowercase: true,
        },
        province: {
            type: String,
            enum: vietnameseProvinces,
            required: true,
            lowercase: true,
        },
        country: {
            type: String,
            default: "việt nam"
        },
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        postalCode: {
            type: Number,
            required: true
        },
        zipCode:String
    },
    {
        versionKey: '__v',
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
)
const Address = mongoose.model('Address', addressSchema)
export default Address