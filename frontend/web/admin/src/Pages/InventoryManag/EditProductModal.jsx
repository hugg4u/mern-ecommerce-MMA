import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import InventoryService from '../../Services/Inventory/InventoryService'
import ResponseHandler from '../../Utils/Constants/ResponseHandler'
import Toaster from '../../Utils/Constants/Toaster'

export default function EditProductModal({ productId, fetchProducts, onClose }) {
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [imageFile, setImageFile] = useState(null)
    const [currentImage, setCurrentImage] = useState('')
    const [previewImage, setPreviewImage] = useState(null)

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            price: '',
            category: '',
            stock: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Tên sản phẩm là bắt buộc'),
            description: Yup.string().required('Mô tả sản phẩm là bắt buộc'),
            price: Yup.number().positive('Giá phải là số dương').required('Giá sản phẩm là bắt buộc'),
            category: Yup.string().required('Danh mục sản phẩm là bắt buộc'),
            stock: Yup.number().integer('Số lượng phải là số nguyên').min(0, 'Số lượng không thể âm').required('Số lượng là bắt buộc')
        }),
        onSubmit: async (values) => {
            setLoading(true)
            Toaster.loadingToast('Đang cập nhật sản phẩm...')
            
            try {
                // Upload image if provided
                let imageUrl = currentImage
                if (imageFile) {
                    try {
                        // Chuyển đổi ảnh thành base64
                        const reader = new FileReader();
                        reader.readAsDataURL(imageFile);
                        await new Promise((resolve, reject) => {
                            reader.onload = resolve;
                            reader.onerror = reject;
                        });
                        const base64Image = reader.result;
                        
                        const formData = new FormData();
                        formData.append('image', base64Image);
                        formData.append('productId', productId);
                        
                        const uploadResult = await InventoryService.uploadProductImage(formData);
                        if (uploadResult.data && uploadResult.data.data) {
                            imageUrl = uploadResult.data.data.url;
                        } else {
                            throw new Error('Không nhận được URL ảnh từ server');
                        }
                    } catch (uploadError) {
                        console.error('Lỗi khi tải ảnh:', uploadError);
                        Toaster.justToast('warning', 'Không thể tải ảnh lên, sẽ sử dụng ảnh hiện tại');
                    }
                }
                
                // Update product
                const productData = {
                    productId,
                    ...values,
                    images: imageUrl ? [imageUrl] : []
                }
                
                console.log('Dữ liệu cập nhật:', productData);
                const result = await InventoryService.updateProduct(productData)
                
                if (result.data.code === 200) {
                    Toaster.updateLoadingToast('success', 'Cập nhật sản phẩm thành công', () => {})
                    setTimeout(() => {
                        closeModal()
                        fetchProducts()
                    }, 1000);
                } else {
                    throw new Error(result.data.message || 'Cập nhật không thành công');
                }
            } catch (error) {
                console.error('Lỗi cập nhật sản phẩm:', error);
                ResponseHandler.handleResponse(error)
                Toaster.updateLoadingToast('error', `Cập nhật sản phẩm thất bại: ${error.message || 'Lỗi không xác định'}`, () => {})
            } finally {
                setLoading(false)
                Toaster.dismissLoadingToast()
            }
        }
    })

    const fetchProductDetails = async () => {
        setFetchLoading(true)
        try {
            console.log('Đang tải thông tin sản phẩm với ID:', productId)
            // Kiểm tra xem productId có tồn tại hay không
            if (!productId) {
                throw new Error('Không có ID sản phẩm')
            }
            
            const result = await InventoryService.getProductById(productId)
            console.log('Kết quả API getProductById:', result.data)
            
            if (result.data.code === 200) {
                const product = result.data.data.product
                console.log('Thông tin sản phẩm nhận được:', product)
                
                if (!product) {
                    throw new Error('Không nhận được dữ liệu sản phẩm từ server')
                }
                
                formik.setValues({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price || '',
                    category: product.category || '',
                    stock: product.pieces || product.stock || 0
                })
                
                if (product.images && product.images.length > 0) {
                    setCurrentImage(product.images[0])
                } else if (product.imgUrl) {
                    setCurrentImage(product.imgUrl)
                }
            } else {
                throw new Error(result.data.message || 'Không thể tải thông tin sản phẩm')
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin sản phẩm:', error)
            ResponseHandler.handleResponse(error)
            Toaster.justToast('error', `Không thể tải thông tin sản phẩm: ${error.message || 'Lỗi không xác định'}`)
            closeModal()
        } finally {
            setFetchLoading(false)
        }
    }

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file)
            setPreviewImage(URL.createObjectURL(file))
        }
    }

    const closeModal = () => {
        // Xóa preview image nếu có
        if (previewImage) {
            URL.revokeObjectURL(previewImage)
        }
        
        // Reset form
        formik.resetForm()
        setImageFile(null)
        setCurrentImage('')
        setPreviewImage(null)
        
        // Đóng modal
        if (onClose) onClose()
    }

    useEffect(() => {
        if (productId) {
            fetchProductDetails()
        }
        
        // Cleanup khi component unmount
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage)
            }
        }
    }, [productId])

    return (
        <div className="modal fade" id="editProductModal" tabIndex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="editProductModalLabel">Chỉnh sửa sản phẩm</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        {fetchLoading ? (
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                                <p className="mt-2">Đang tải thông tin sản phẩm...</p>
                            </div>
                        ) : (
                            <form onSubmit={formik.handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="edit-name" className="form-label">Tên Sản Phẩm</label>
                                        <input
                                            type="text"
                                            className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                                            id="edit-name"
                                            name="name"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.name && formik.errors.name && (
                                            <div className="invalid-feedback">{formik.errors.name}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="edit-category" className="form-label">Danh Mục</label>
                                        <select
                                            className={`form-select ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''}`}
                                            id="edit-category"
                                            name="category"
                                            value={formik.values.category}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        >
                                            <option value="">Chọn danh mục</option>
                                            <option value="Điện thoại">Điện thoại</option>
                                            <option value="Laptop">Laptop</option>
                                            <option value="Máy tính bảng">Máy tính bảng</option>
                                            <option value="Đồng hồ thông minh">Đồng hồ thông minh</option>
                                            <option value="Phụ kiện">Phụ kiện</option>
                                        </select>
                                        {formik.touched.category && formik.errors.category && (
                                            <div className="invalid-feedback">{formik.errors.category}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="edit-description" className="form-label">Mô Tả</label>
                                    <textarea
                                        className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                        id="edit-description"
                                        name="description"
                                        rows="3"
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    ></textarea>
                                    {formik.touched.description && formik.errors.description && (
                                        <div className="invalid-feedback">{formik.errors.description}</div>
                                    )}
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="edit-price" className="form-label">Giá ($)</label>
                                        <input
                                            type="number"
                                            className={`form-control ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}
                                            id="edit-price"
                                            name="price"
                                            value={formik.values.price}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.price && formik.errors.price && (
                                            <div className="invalid-feedback">{formik.errors.price}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="edit-stock" className="form-label">Số Lượng</label>
                                        <input
                                            type="number"
                                            className={`form-control ${formik.touched.stock && formik.errors.stock ? 'is-invalid' : ''}`}
                                            id="edit-stock"
                                            name="stock"
                                            value={formik.values.stock}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.stock && formik.errors.stock && (
                                            <div className="invalid-feedback">{formik.errors.stock}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="edit-productImage" className="form-label">Hình Ảnh Sản Phẩm</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        id="edit-productImage" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <div className="mt-2 d-flex align-items-center gap-3">
                                        {previewImage && (
                                            <div>
                                                <img 
                                                    src={previewImage} 
                                                    alt="Preview" 
                                                    className="img-thumbnail" 
                                                    style={{ height: '100px' }} 
                                                />
                                                <p className="mb-0 mt-1 small text-muted">Hình ảnh mới</p>
                                            </div>
                                        )}
                                        
                                        {currentImage && !previewImage && (
                                            <div>
                                                <img 
                                                    src={currentImage} 
                                                    alt="Current" 
                                                    className="img-thumbnail" 
                                                    style={{ height: '100px' }} 
                                                />
                                                <p className="mb-0 mt-1 small text-muted">Hình ảnh hiện tại</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer px-0 pb-0">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        data-bs-dismiss="modal"
                                        onClick={closeModal}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary" 
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 