import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import BannerService from '../../Services/Banner/BannerService'
import ResponseHandler from '../../Utils/ResponseHandler'
import Toaster from '../../Utils/Constants/Toaster'
import UploadService from '../../Services/image-upload.service'

export default function AddBannerModal({ fetchBanners }) {
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState(null)
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
            startDate: Yup.date(),
            endDate: Yup.date()
                .min(Yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
        }),
        onSubmit: async (values) => {
            if (!imageFile) {
                Toaster.justToast('error', 'Vui lòng chọn hình ảnh cho banner');
                return;
            }
            
            setLoading(true);
            Toaster.loadingToast('Đang thêm banner mới...');
            
            try {
                // Tải hình ảnh lên
                const formData = new FormData();
                formData.append('image', imageFile);
                
                const uploadResponse = await UploadService.uploadImageToServer('banners', formData);
                
                if (ResponseHandler.responseSuccess(uploadResponse)) {
                    // Tạo banner với thông tin đã nhập
                    const bannerData = {
                        title: values.title,
                        description: values.description || '',
                        order: values.order,
                        isActive: values.isActive,
                        url: values.url || '',
                        startDate: values.startDate || null,
                        endDate: values.endDate || null,
                        imageUrl: uploadResponse.data.imageUrl
                    };
                    
                    const createResponse = await BannerService.createBanner(bannerData);
                    
                    if (ResponseHandler.responseSuccess(createResponse)) {
                        Toaster.updateLoadingToast('success', 'Thêm banner thành công', () => {})
                        document.getElementById('addBannerModalCloseBtn').click()
                        formik.resetForm()
                        setImageFile(null)
                        setPreviewImage(null)
                        if (fetchBanners) fetchBanners()
                    } else {
                        Toaster.updateLoadingToast('error', 'Thêm banner thất bại: ' + createResponse.message, () => {})
                    }
                } else {
                    Toaster.updateLoadingToast('error', 'Lỗi khi tải hình ảnh: ' + uploadResponse.message, () => {})
                }
            } catch (error) {
                console.error('Lỗi khi tạo banner:', error);
                ResponseHandler.handleResponse(error)
                Toaster.updateLoadingToast('error', 'Thêm banner thất bại', () => {})
            } finally {
                setLoading(false)
                Toaster.dismissLoadingToast()
            }
        }
    });

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Kiểm tra kích thước và loại file
            if (file.size > 5 * 1024 * 1024) {
                Toaster.justToast('error', 'Kích thước file quá lớn (tối đa 5MB)');
                return;
            }

            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
                Toaster.justToast('error', 'Chỉ chấp nhận file hình ảnh (JPEG, PNG, JPG, WEBP)');
                return;
            }

            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    return (
        <div className="modal fade" id="addBannerModal" tabIndex="-1" aria-labelledby="addBannerModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="addBannerModalLabel">Thêm Banner Mới</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="addBannerModalCloseBtn"></button>
                    </div>
                    <div className="modal-body">
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
                                {previewImage && (
                                    <div className="mt-2">
                                        <img 
                                            src={previewImage} 
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
                                    {loading ? 'Đang xử lý...' : 'Thêm Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 