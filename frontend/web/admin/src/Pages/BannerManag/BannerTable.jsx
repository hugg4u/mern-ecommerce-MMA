import React from 'react'
import Swal from 'sweetalert2'

export default function BannerTable({ banners, loading, handleBannerDelete, handleEditBanner, onRefresh }) {
    // Xử lý hành động xóa
    const confirmDelete = (bannerId, bannerTitle) => {
        Swal.fire({
            title: 'Xác nhận xóa?',
            text: `Bạn có chắc chắn muốn xóa banner này không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Đang xóa...',
                    text: 'Vui lòng đợi trong giây lát',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        Swal.showLoading();
                        handleBannerDelete(bannerId)
                            .then(() => {
                                Swal.fire(
                                    'Đã xóa!',
                                    `Banner đã được xóa thành công.`,
                                    'success'
                                );
                            })
                            .catch((error) => {
                                console.error('Lỗi khi xóa banner:', error);
                                Swal.fire(
                                    'Lỗi!',
                                    `Không thể xóa banner: ${error.message || 'Lỗi không xác định'}`,
                                    'error'
                                );
                            });
                    }
                });
            }
        })
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
        )
    }

    // Render danh sách trống
    if (!banners || banners.length === 0) {
        return (
            <div className="text-center py-5">
                <p>Không có banner nào. Hãy thêm banner mới!</p>
                <button 
                    onClick={onRefresh} 
                    className="btn btn-outline-primary mt-2"
                >
                    <i className="ti ti-refresh me-1"></i>
                    Làm mới
                </button>
            </div>
        )
    }

    return (
        <table className="table mb-0 align-middle">
            <thead className="text-dark fs-4">
                <tr>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">ID</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Hình Ảnh</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Tiêu Đề</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Trạng Thái</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Thứ Tự</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Thao Tác</h6>
                    </th>
                </tr>
            </thead>
            <tbody>
                {banners.map((banner, index) => (
                    <tr key={banner.bid || index}>
                        <td className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">{index + 1}</h6>
                            <small className="text-muted d-block">ID: {banner.bid.substring(0, 8)}...</small>
                        </td>
                        <td className="border-bottom-0">
                            {banner.imageUrl ? (
                                <img 
                                    src={banner.imageUrl} 
                                    alt="Banner" 
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    className="rounded"
                                    onClick={() => window.open(banner.imageUrl, '_blank')}
                                    title="Nhấp để xem kích thước đầy đủ"
                                />
                            ) : (
                                <div 
                                    className="bg-light d-flex align-items-center justify-content-center rounded" 
                                    style={{ width: '50px', height: '50px' }}
                                >
                                    <i className="ti ti-photo text-muted"></i>
                                </div>
                            )}
                        </td>
                        <td className="border-bottom-0">
                            <h6 className="fw-semibold mb-1">{banner.title}</h6>
                            <p className="mb-0 fw-normal text-truncate" style={{ maxWidth: '200px' }}>
                                {banner.description}
                            </p>
                        </td>
                        <td className="border-bottom-0">
                            <span className={`badge rounded-3 fw-semibold ${banner.isActive ? 'bg-success' : 'bg-danger'}`}>
                                {banner.isActive ? 'Hiển thị' : 'Ẩn'}
                            </span>
                        </td>
                        <td className="border-bottom-0">
                            <h6 className="fw-semibold mb-0 fs-4">{banner.order || 0}</h6>
                        </td>
                        <td className="border-bottom-0">
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleEditBanner(banner.bid)}
                                    data-bs-toggle="modal" 
                                    data-bs-target="#editBannerModal"
                                >
                                    Sửa
                                </button>
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => confirmDelete(banner.bid, banner.title)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
} 