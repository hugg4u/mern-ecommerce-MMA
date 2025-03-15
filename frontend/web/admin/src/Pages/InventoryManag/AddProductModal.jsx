import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import InventoryService from '../../Services/Inventory/InventoryService'
import ResponseHandler from '../../Utils/Constants/ResponseHandler'
import Toaster from '../../Utils/Constants/Toaster'

export default function AddProductModal({ fetchProducts }) {
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState(null)

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
            Toaster.loadingToast('Đang thêm sản phẩm...')
            
            try {
                // Upload image if provided
                let imageUrl = null
                if (imageFile) {
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
                    
                    const uploadResult = await InventoryService.uploadProductImage(formData);
                    if (uploadResult.data && uploadResult.data.data) {
                        imageUrl = uploadResult.data.data.url;
                    }
                }
                
                // Add product
                const productData = {
                    ...values,
                    images: imageUrl ? [imageUrl] : []
                }
                
                const result = await InventoryService.addProduct(productData)
                
                if (result.data.code === 200) {
                    Toaster.updateLoadingToast('success', 'Thêm sản phẩm thành công', () => {})
                    document.getElementById('addProductModalCloseBtn').click()
                    formik.resetForm()
                    setImageFile(null)
                    if (fetchProducts) fetchProducts()
                }
            } catch (error) {
                ResponseHandler.handleResponse(error)
                Toaster.updateLoadingToast('error', 'Thêm sản phẩm thất bại', () => {})
            } finally {
                setLoading(false)
                Toaster.dismissLoadingToast()
            }
        }
    })

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0])
        }
    }

    return (
        <div className="modal fade" id="addProductModal" tabIndex="-1" aria-labelledby="addProductModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="addProductModalLabel">Thêm Sản Phẩm Mới</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="addProductModalCloseBtn"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={formik.handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Tên Sản Phẩm</label>
                                <input
                                    type="text"
                                    className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <div className="invalid-feedback">{formik.errors.name}</div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Mô Tả</label>
                                <textarea
                                    className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                    id="description"
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
                                    <label htmlFor="price" className="form-label">Giá</label>
                                    <input
                                        type="number"
                                        className={`form-control ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}
                                        id="price"
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
                                    <label htmlFor="stock" className="form-label">Số Lượng</label>
                                    <input
                                        type="number"
                                        className={`form-control ${formik.touched.stock && formik.errors.stock ? 'is-invalid' : ''}`}
                                        id="stock"
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
                                <label htmlFor="category" className="form-label">Danh Mục</label>
                                <select
                                    className={`form-select ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''}`}
                                    id="category"
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
                            <div className="mb-3">
                                <label htmlFor="productImage" className="form-label">Hình Ảnh Sản Phẩm</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    id="productImage" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imageFile && (
                                    <div className="mt-2">
                                        <img 
                                            src={URL.createObjectURL(imageFile)} 
                                            alt="Preview" 
                                            className="img-thumbnail" 
                                            style={{ maxHeight: '100px' }} 
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer px-0 pb-0">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? 'Đang xử lý...' : 'Thêm Sản Phẩm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
} 