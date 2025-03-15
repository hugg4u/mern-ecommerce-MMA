import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import BannerService from '../../Services/Banner/BannerService'
import ResponseHandler from '../../Utils/ResponseHandler'
import Toaster from '../../Utils/Constants/Toaster'
import UploadService from '../../Services/image-upload.service'

export default function EditBannerModal({ bannerId, fetchBanners, onClose }) {
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [imageFile, setImageFile] = useState(null)
    const [currentImage, setCurrentImage] = useState('')
    const [previewImage, setPreviewImage] = useState(null)

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            order: 0,
            isActive: true,
            url: '',
            startDate: '',
            endDate: ''
        },
        validationSchema: Yup.object({
            title: Yup.string()
                .required('Tiêu đề banner là bắt buộc')
                .max(100, 'Tiêu đề không được vượt quá 100 ký tự'),
            description: Yup.string()
                .max(500, 'Mô tả không được vượt quá 500 ký tự'),
            order: Yup.number()
                .integer('Thứ tự phải là số nguyên')
                .min(0, 'Thứ tự không được âm'),
            isActive: Yup.boolean(),
            url: Yup.string().url('Đường dẫn không hợp lệ'),
            startDate: Yup.date().nullable(),
            endDate: Yup.date().nullable()
                .min(Yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
        }),
        onSubmit: async (values) => {
            setLoading(true)
            Toaster.loadingToast('Đang cập nhật banner...')
            
            try {
                // Xử lý tải ảnh mới nếu có
                let updatedImageUrl = currentImage
                
                if (imageFile) {
                    try {
                        // Phương pháp 1: Sử dụng UploadService.uploadImageToServer
                        const formData = new FormData()
                        formData.append('image', imageFile)
                        formData.append('bannerId', bannerId) // Thêm bannerId vào formData
                        
                        const uploadResponse = await UploadService.uploadImageToServer('banners', formData)
                        
                        if (ResponseHandler.responseSuccess(uploadResponse)) {
                            console.log('Tải ảnh thành công:', uploadResponse)
                            updatedImageUrl = uploadResponse.data.imageUrl
                        } else {
                            // Phương pháp 2: Thử chuyển đổi sang base64 và sử dụng BannerService.uploadBannerImage
                            console.log('Đang thử phương pháp tải ảnh thứ 2...')
                            
                            // Chuyển đổi ảnh thành base64
                            const base64Image = await UploadService.getBase64(imageFile)
                            
                            // Sử dụng BannerService để tải ảnh
                            const uploadResult = await BannerService.uploadBannerImage(base64Image, bannerId)
                            
                            if (ResponseHandler.responseSuccess(uploadResult)) {
                                console.log('Tải ảnh thành công (phương pháp 2):', uploadResult)
                                updatedImageUrl = uploadResult.data.imageUrl
                            } else {
                                throw new Error('Không thể tải ảnh lên sử dụng cả hai phương pháp')
                            }
                        }
                    } catch (uploadError) {
                        console.error('Chi tiết lỗi khi tải ảnh:', uploadError)
                        Toaster.justToast('warning', 'Không thể tải ảnh lên, sẽ sử dụng ảnh hiện tại')
                    }
                }
                
                // Cập nhật dữ liệu banner
                const bannerData = {
                    title: values.title,
                    description: values.description || '',
                    order: values.order,
                    isActive: values.isActive,
                    url: values.url || '',
                    startDate: values.startDate || null,
                    endDate: values.endDate || null,
                    imageUrl: updatedImageUrl
                }
                
                console.log('Dữ liệu cập nhật banner:', bannerData)
                const updateResponse = await BannerService.updateBanner(bannerId, bannerData)
                
                if (ResponseHandler.responseSuccess(updateResponse)) {
                    Toaster.updateLoadingToast('success', 'Cập nhật banner thành công', () => {})
                    setTimeout(() => {
                        closeModal()
                        fetchBanners()
                    }, 1000)
                } else {
                    throw new Error(updateResponse.message || 'Cập nhật không thành công')
                }
            } catch (error) {
                console.error('Lỗi khi cập nhật banner:', error)
                ResponseHandler.handleResponse(error)
                Toaster.updateLoadingToast('error', `Cập nhật banner thất bại: ${error.message || 'Lỗi không xác định'}`, () => {})
            } finally {
                setLoading(false)
                Toaster.dismissLoadingToast()
            }
        }
    })

    const fetchBannerDetails = async () => {
        setFetchLoading(true)
        try {
            console.log('Đang tải thông tin banner với ID:', bannerId)
            // Kiểm tra xem bannerId có tồn tại hay không
            if (!bannerId) {
                throw new Error('Không có ID banner')
            }
            
            const response = await BannerService.getBannerById(bannerId)
            console.log('Kết quả API getBannerById:', response)
            
            if (ResponseHandler.responseSuccess(response)) {
                const bannerData = response.data
                console.log('Thông tin banner nhận được:', bannerData)
                
                if (!bannerData) {
                    throw new Error('Không nhận được dữ liệu banner từ server')
                }
                
                formik.setValues({
                    title: bannerData.title || '',
                    description: bannerData.description || '',
                    order: bannerData.order || 0,
                    isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
                    url: bannerData.url || '',
                    startDate: bannerData.startDate ? new Date(bannerData.startDate).toISOString().split('T')[0] : '',
                    endDate: bannerData.endDate ? new Date(bannerData.endDate).toISOString().split('T')[0] : ''
                })
                
                if (bannerData.imageUrl) {
                    setCurrentImage(bannerData.imageUrl)
                }
            } else {
                throw new Error(response.message || 'Không thể tải thông tin banner')
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin banner:', error)
            ResponseHandler.handleResponse(error)
            Toaster.justToast('error', `Không thể tải thông tin banner: ${error.message || 'Lỗi không xác định'}`)
            closeModal()
        } finally {
            setFetchLoading(false)
        }
    }

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            
            // Kiểm tra kích thước và loại file
            if (file.size > 5 * 1024 * 1024) {
                Toaster.justToast('error', 'Kích thước file quá lớn (tối đa 5MB)')
                return
            }

            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
                Toaster.justToast('error', 'Chỉ chấp nhận file hình ảnh (JPEG, PNG, JPG, WEBP)')
                return
            }
            
            setImageFile(file)
            setPreviewImage(URL.createObjectURL(file))
            // Thêm log để xác nhận file đã được chọn
            console.log('Đã chọn file ảnh mới:', file.name, file.type, file.size)
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
        if (bannerId) {
            fetchBannerDetails()
        }
        
        // Cleanup khi component unmount
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage)
            }
        }
    }, [bannerId])

    return (
        <div className="modal fade" id="editBannerModal" tabIndex="-1" aria-labelledby="editBannerModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="editBannerModalLabel">Chỉnh sửa banner</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        {fetchLoading ? (
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                                <p className="mt-2">Đang tải thông tin banner...</p>
                            </div>
                        ) : (
                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Tiêu Đề Banner</label>
                                    <input
                                        type="text"
                                        className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                                        id="title"
                                        name="title"
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.title && formik.errors.title && (
                                        <div className="invalid-feedback">{formik.errors.title}</div>
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
                                        <label htmlFor="order" className="form-label">Thứ Tự Hiển Thị</label>
                                        <input
                                            type="number"
                                            className={`form-control ${formik.touched.order && formik.errors.order ? 'is-invalid' : ''}`}
                                            id="order"
                                            name="order"
                                            min="0"
                                            value={formik.values.order}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.order && formik.errors.order && (
                                            <div className="invalid-feedback">{formik.errors.order}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="url" className="form-label">Đường Dẫn Liên Kết</label>
                                        <input
                                            type="text"
                                            className={`form-control ${formik.touched.url && formik.errors.url ? 'is-invalid' : ''}`}
                                            id="url"
                                            name="url"
                                            placeholder="https://..."
                                            value={formik.values.url}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.url && formik.errors.url && (
                                            <div className="invalid-feedback">{formik.errors.url}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="startDate" className="form-label">Ngày Bắt Đầu</label>
                                        <input
                                            type="date"
                                            className={`form-control ${formik.touched.startDate && formik.errors.startDate ? 'is-invalid' : ''}`}
                                            id="startDate"
                                            name="startDate"
                                            value={formik.values.startDate}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.startDate && formik.errors.startDate && (
                                            <div className="invalid-feedback">{formik.errors.startDate}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="endDate" className="form-label">Ngày Kết Thúc</label>
                                        <input
                                            type="date"
                                            className={`form-control ${formik.touched.endDate && formik.errors.endDate ? 'is-invalid' : ''}`}
                                            id="endDate"
                                            name="endDate"
                                            value={formik.values.endDate}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.endDate && formik.errors.endDate && (
                                            <div className="invalid-feedback">{formik.errors.endDate}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={formik.values.isActive}
                                            onChange={formik.handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="isActive">
                                            Hiển thị banner (Khi tắt, banner sẽ không hiển thị cho người dùng)
                                        </label>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="bannerImage" className="form-label">Hình Ảnh Banner</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        id="bannerImage" 
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleImageChange}
                                    />
                                    <div className="form-text">Để trống nếu muốn giữ nguyên ảnh hiện tại</div>
                                    <div className="mt-2 d-flex gap-2 align-items-center">
                                        {currentImage && !previewImage && (
                                            <div>
                                                <img 
                                                    src={currentImage} 
                                                    alt="Current Banner" 
                                                    className="img-thumbnail" 
                                                    style={{ maxHeight: '100px' }} 
                                                />
                                                <p className="small text-muted mb-0 mt-1">Hình ảnh hiện tại</p>
                                            </div>
                                        )}
                                        {previewImage && (
                                            <div>
                                                <img 
                                                    src={previewImage} 
                                                    alt="New Banner" 
                                                    className="img-thumbnail" 
                                                    style={{ maxHeight: '100px' }} 
                                                />
                                                <p className="small text-muted mb-0 mt-1">Hình ảnh mới</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer px-0 pb-0">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={closeModal}>Hủy</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Đang xử lý...' : 'Cập Nhật Banner'}
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