import React from 'react'
import Swal from 'sweetalert2'

export default function PaymentTable({ payments, loading, handleStatusUpdate, handlePaymentDelete }) {
    const getStatusBadge = (status) => {
        switch(status) {
            case 'Đã thanh toán':
                return 'bg-success';
            case 'Đang xử lý':
                return 'bg-warning';
            case 'Đã hủy':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }

    const confirmStatusChange = (paymentId, currentStatus) => {
        const statusOptions = ['Đã thanh toán', 'Đang xử lý', 'Đã hủy'];
        
        Swal.fire({
            title: 'Cập nhật trạng thái',
            input: 'select',
            inputOptions: {
                'Đã thanh toán': 'Đã thanh toán',
                'Đang xử lý': 'Đang xử lý',
                'Đã hủy': 'Đã hủy'
            },
            inputValue: currentStatus,
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy',
            inputValidator: (value) => {
                if (!value) {
                    return 'Bạn cần chọn một trạng thái!'
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                handleStatusUpdate(paymentId, result.value)
            }
        })
    }

    const confirmDelete = (paymentId, orderNumber) => {
        Swal.fire({
            title: 'Xác nhận xóa?',
            text: `Bạn có chắc chắn muốn xóa thanh toán cho đơn hàng #${orderNumber} không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                handlePaymentDelete(paymentId)
            }
        })
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải dữ liệu thanh toán...</p>
            </div>
        )
    }

    if (!payments || payments.length === 0) {
        return (
            <div className="text-center py-5">
                <p>Không có dữ liệu thanh toán nào.</p>
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
                        <h6 className="fw-semibold mb-0">Đơn hàng</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Khách hàng</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Phương thức</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Số tiền</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Trạng thái</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Ngày thanh toán</h6>
                    </th>
                    <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Thao tác</h6>
                    </th>
                </tr>
            </thead>
            <tbody>
                {payments.map((payment, index) => (
                    <tr key={payment._id || index}>
                        <td className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">{index + 1}</h6>
                        </td>
                        <td className="border-bottom-0">
                            <h6 className="fw-semibold mb-1">#{payment.orderNumber}</h6>
                        </td>
                        <td className="border-bottom-0">
                            <p className="mb-0 fw-normal">{payment.customerName}</p>
                            <small className="text-muted">{payment.customerEmail}</small>
                        </td>
                        <td className="border-bottom-0">
                            <span className="badge bg-primary rounded-3 fw-semibold">
                                {payment.paymentMethod}
                            </span>
                        </td>
                        <td className="border-bottom-0">
                            <h6 className="fw-semibold mb-0 fs-4">${payment.amount}</h6>
                        </td>
                        <td className="border-bottom-0">
                            <span 
                                className={`badge rounded-3 fw-semibold ${getStatusBadge(payment.status)}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => confirmStatusChange(payment._id, payment.status)}
                            >
                                {payment.status}
                            </span>
                        </td>
                        <td className="border-bottom-0">
                            <p className="mb-0 fw-normal">
                                {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                            </p>
                            <small className="text-muted">
                                {new Date(payment.paymentDate).toLocaleTimeString('vi-VN')}
                            </small>
                        </td>
                        <td className="border-bottom-0">
                            <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => confirmDelete(payment._id, payment.orderNumber)}
                            >
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
} 