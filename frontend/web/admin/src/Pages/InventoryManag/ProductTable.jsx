import React from 'react'
import Swal from 'sweetalert2'

export default function ProductTable({ products, loading, handleProductDelete, handleEditProduct }) {
    const confirmDelete = (productId, productName) => {
        Swal.fire({
            title: 'Xác nhận xóa?',
            text: `Bạn có chắc chắn muốn xóa sản phẩm "${productName}" không?`,
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
                        handleProductDelete(productId)
                            .then(() => {
                                Swal.fire(
                                    'Đã xóa!',
                                    `Sản phẩm "${productName}" đã được xóa thành công.`,
                                    'success'
                                );
                            })
                            .catch((error) => {
                                console.error('Lỗi khi xóa sản phẩm:', error);
                                Swal.fire(
                                    'Lỗi!',
                                    `Không thể xóa sản phẩm: ${error.message || 'Lỗi không xác định'}`,
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

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-5">
                <p>Không có sản phẩm nào. Hãy thêm sản phẩm mới!</p>
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
                        <h6 className="fw-semibold mb-0">Tên Sản Phẩm</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Danh Mục</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Giá</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Tồn Kho</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Thao Tác</h6>
                    </th>
                </tr>
            </thead>
            <tbody>
                {products.map((product, index) => (
                    <tr key={product._id || index}>
                        <td className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">{index + 1}</h6>
                            <small className="text-muted d-block">ID: {product.pid}</small>
                        </td>
                        <td className="border-bottom-0">
                            {product.images && product.images.length > 0 ? (
                                <img 
                                    src={product.images[0]} 
                                    alt={product.name} 
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    className="rounded"
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
                            <h6 className="fw-semibold mb-1">{product.name}</h6>
                            <p className="mb-0 fw-normal text-truncate" style={{ maxWidth: '200px' }}>
                                {product.description}
                            </p>
                        </td>
                        <td className="border-bottom-0">
                            <span className="badge bg-primary rounded-3 fw-semibold">
                                {product.category}
                            </span>
                        </td>
                        <td className="border-bottom-0">
                            <h6 className="fw-semibold mb-0 fs-4">${product.price}</h6>
                        </td>
                        <td className="border-bottom-0">
                            <span className={`badge rounded-3 fw-semibold ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                {product.stock}
                            </span>
                        </td>
                        <td className="border-bottom-0">
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleEditProduct(product.pid)}
                                >
                                    Sửa
                                </button>
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => confirmDelete(product.pid, product.name)}
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