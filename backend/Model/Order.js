import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { orderStatus, paymentStatus, paymentMethods } from "../Utils/Constants/OrderStatus.js";
import vietnameseProvinces from "../Utils/Constants/Address/Provinces.js";
import vietnameseDistricts from "../Utils/Constants/Address/District.js";

// Schema cho các sản phẩm trong đơn hàng
const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Số lượng phải là số dương']
        },
        price: {
            type: Number,
            required: true
        },
        imgUrl: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

// Schema cho địa chỉ giao hàng
const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        note: {
            type: String
        }
    },
    { _id: false }
);

// Schema chính cho đơn hàng
const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            default: () => `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
            unique: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        items: [orderItemSchema],
        shippingAddress: shippingAddressSchema,
        status: {
            type: String,
            enum: orderStatus,
            default: 'pending'
        },
        paymentStatus: {
            type: String,
            enum: paymentStatus,
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            enum: paymentMethods,
            default: 'cod'
        },
        shippingFee: {
            type: Number,
            default: 0
        },
        subtotal: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        },
        notes: {
            type: String
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: orderStatus,
                    required: true
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                note: String
            }
        ],
        paymentHistory: [
            {
                status: {
                    type: String,
                    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
                    default: 'pending'
                },
                provider: {
                    type: String,
                    enum: ['cod', 'vnpay', 'banking', 'other'],
                    default: 'cod'
                },
                amount: {
                    type: Number,
                    default: 0
                },
                transactionId: {
                    type: String,
                    default: ''
                },
                responseCode: {
                    type: String,
                    default: ''
                },
                responseMessage: {
                    type: String,
                    default: ''
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                note: {
                    type: String,
                    default: ''
                },
                metadata: {
                    type: Object,
                    default: {}
                }
            }
        ],
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
    }
);

// Pre-save hook để cập nhật lịch sử trạng thái khi trạng thái thay đổi
orderSchema.pre('save', function(next) {
    // Nếu là đơn hàng mới hoặc trạng thái đã thay đổi
    if (this.isNew || this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            note: `Trạng thái đơn hàng chuyển thành: ${this.status}`
        });
    }
    
    // Tính toán lại tổng tiền
    if (this.isNew || this.isModified('items') || this.isModified('shippingFee') || this.isModified('discount')) {
        this.subtotal = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        this.total = this.subtotal + this.shippingFee - this.discount;
    }
    
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order; 