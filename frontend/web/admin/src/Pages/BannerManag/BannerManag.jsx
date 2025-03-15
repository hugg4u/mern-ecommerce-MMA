import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import BannerService from '../../Services/Banner/BannerService'
import ResponseHandler from '../../Utils/ResponseHandler'
import BannerTable from './BannerTable'
import AddBannerModal from './AddBannerModal'
import EditBannerModal from './EditBannerModal'
import Toaster from '../../Utils/Constants/Toaster'
import PdfGenerator from '../../Utils/Pdfs/PdfGenerator'

export default function BannerManag() {
    const [loading, setLoading] = useState(false)
    const [banners, setBanners] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [editingBannerId, setEditingBannerId] = useState(null)

    const fetchBanners = async () => {
        setLoading(true)
        try {
            const result = await BannerService.getAllBanners()
            if (ResponseHandler.responseSuccess(result)) {
                setBanners(result.data || [])
            } else {
                Toaster.justToast('error', 'Không thể lấy danh sách banner: ' + result.message)
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách banner:', error)
            ResponseHandler.handleResponse(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditBanner = (bannerId) => {
        console.log('Sửa banner với ID:', bannerId);
        if (!bannerId) {
            console.error('Không tìm thấy ID banner!');
            Toaster.justToast('error', 'Không thể chỉnh sửa banner: Thiếu ID banner');
            return;
        }
        setEditingBannerId(bannerId);
    }

    const handleEditModalClose = () => {
        setEditingBannerId(null)
    }

    const handleBannerDelete = async (bannerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await BannerService.deleteBanner(bannerId)
                if (ResponseHandler.responseSuccess(result)) {
                    // Cập nhật danh sách banner sau khi xóa thành công
                    setBanners(prevBanners => prevBanners.filter(banner => banner.bid !== bannerId))
                    resolve(result)
                } else {
                    reject(new Error(result.message || 'Xóa banner thất bại'))
                }
            } catch (error) {
                console.error('Lỗi khi xóa banner:', error)
                ResponseHandler.handleResponse(error)
                reject(error)
            }
        })
    }

    const generatePDF = () => {
        Toaster.loadingToast('Đang tạo PDF...')
        try {
            const bannerHeaders = [
                { header: 'STT', dataKey: 'id' },
                { header: 'Tiêu đề', dataKey: 'title' },
                { header: 'Thứ tự', dataKey: 'order' },
                { header: 'Trạng thái', dataKey: 'status' },
                { header: 'Ngày tạo', dataKey: 'created_at' }
            ]
            
            const formattedBanners = banners.map((banner, index) => ({
                id: index + 1,
                title: banner.title,
                order: banner.order || 0,
                status: banner.isActive ? 'Hiển thị' : 'Ẩn',
                created_at: new Date(banner.created_at).toLocaleDateString('vi-VN')
            }))
            
            Toaster.updateLoadingToast('success', 'Đang tạo PDF cho bạn', () => {})
            PdfGenerator.generatePdf(formattedBanners, "Danh sách banner", bannerHeaders)
        } catch (error) {
            Toaster.updateLoadingToast('error', 'Tạo PDF thất bại', () => {})
        } finally {
            Toaster.dismissLoadingToast()
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const filteredBanners = banners.filter(banner => 
        (banner.title && banner.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (banner.description && banner.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (banner.bid && banner.bid.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    useEffect(() => {
        fetchBanners()
    }, [])

    return (
        <div className="body-wrapper">
            <div className="container-fluid">
                {/*  Row 1 */}
                <div className="row">
                    <div className="col-12 d-flex align-items-stretch">
                        <div className="card w-100 shadow-sm">
                            <div className="card-body p-4">
                                <div className='d-flex justify-content-end align-items-center mb-4'>
                                    <button className='btn btn-outline-dark mx-2' onClick={generatePDF}>Xuất PDF</button>
                                    <button className='btn btn-success' data-bs-toggle="modal" data-bs-target="#addBannerModal">Thêm mới</button>
                                </div>
                                <AddBannerModal fetchBanners={fetchBanners} onClose={() => console.log('Add modal closed')} />
                                <EditBannerModal 
                                    bannerId={editingBannerId} 
                                    fetchBanners={fetchBanners} 
                                    onClose={handleEditModalClose}
                                />
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title fw-semibold">Danh sách banner</h5>
                                    <form className="position-relative">
                                        <input 
                                            type="text" 
                                            className="form-control search-chat py-2 ps-5" 
                                            id="text-srh" 
                                            placeholder="Tìm kiếm banner..." 
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                        <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 text-dark ms-3" />
                                    </form>
                                </div>
                                <div className="table-responsive">
                                    <BannerTable 
                                        banners={filteredBanners} 
                                        loading={loading} 
                                        handleBannerDelete={handleBannerDelete}
                                        handleEditBanner={handleEditBanner}
                                        onRefresh={fetchBanners}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 