import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Số lượng phải là số dương'],
            default: 1
        },
        price: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        items: [cartItemSchema],
        totalAmount: {
            type: Number,
            default: 0
        },
        totalItems: {
            type: Number,
            default: 0
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: '__v',
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
);

// Phương thức để tính toán tổng số lượng và tổng giá tiền
cartSchema.pre('save', async function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    
    this.totalItems = this.items.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
    
    this.updatedAt = Date.now();
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart; 