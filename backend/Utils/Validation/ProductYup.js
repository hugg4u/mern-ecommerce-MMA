import yup from 'yup'

class ProductYup{
    getProduct = yup.object({
        pid: yup.string().required(),
    })
    addProduct = yup.object({
        name: yup.string().required(),
        description: yup.string().required(),
        price: yup.number().required(),
        category: yup.string().required(),
        stock: yup.number().required(),
        images: yup.array().nullable(),
        discount: yup.number().default(0),
        color: yup.string().default('default'),
        pieces: yup.number().default(0),
    })
    addReviews = yup.object({
        pid: yup.string().required(),
        review: yup.array(
            yup.object({
                email: yup.string().email().required(),
                text: yup.string().required(),
                stars:yup.number().required().min(1,'rating must be at least 1').max(5,'rating must be at most 5')
            })
        ).required()
    })
    deleteProduct = yup.object({
        productId: yup.string().required(),
    })
    updateProduct = yup.object({
        productId: yup.string().required(),
        name: yup.string().required(),
        description: yup.string().required(),
        price: yup.number().required(),
        category: yup.string().required(),
        stock: yup.number().required(),
        images: yup.array().nullable(),
        discount: yup.number().optional(),
        color: yup.string().optional(),
        pieces: yup.number().optional(),
    })
    uploadImage = yup.object({
        image: yup.string().required('Ảnh là bắt buộc'),
        productId: yup.string().nullable()
    })
}

export default ProductYup = new ProductYup()