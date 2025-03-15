import * as yup from "yup";

const CartYup = {
    // Schema validation cho API thêm sản phẩm vào giỏ hàng
    addToCart: yup.object({
        body: yup.object({
            productId: yup.string().required("ID sản phẩm là bắt buộc"),
            quantity: yup.number().positive("Số lượng phải là số dương").default(1)
        })
    }),

    // Schema validation cho API cập nhật số lượng sản phẩm
    updateCartItem: yup.object({
        body: yup.object({
            productId: yup.string().required("ID sản phẩm là bắt buộc"),
            quantity: yup.number().required("Số lượng là bắt buộc").positive("Số lượng phải là số dương")
        })
    }),

    // Schema validation cho API xóa sản phẩm
    removeFromCart: yup.object({
        body: yup.object({
            productId: yup.string().required("ID sản phẩm là bắt buộc")
        })
    })
};

export default CartYup; 