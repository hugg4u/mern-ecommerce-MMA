import React, { useEffect, useState } from 'react'
import PaymentTable from './PaymentTable'
import PaymentService from '../../Services/Payment/PaymentService'
import ResponseHandler from '../../Utils/Constants/ResponseHandler'
import Toaster from '../../Utils/Constants/Toaster'
import PdfGenerator from '../../Utils/Pdfs/PdfGenerator'

export default function PaymentManag() {
    const [loading, setLoading] = useState(false)
    const [payments, setPayments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const result = await PaymentService.getPayments()
            if (result.data.code === 200) {
                setPayments(result.data.data.payments || [])
            }
        } catch (error) {
            ResponseHandler.handleResponse(error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (paymentId, status) => {
        Toaster.loadingToast('Đang cập nhật trạng thái...')
        try {
            const result = await PaymentService.updatePaymentStatus(paymentId, status)
            if (result.data.code === 200) {
                Toaster.updateLoadingToast('success', 'Cập nhật trạng thái thành công', () => {})
            }
        } catch (error) {
            ResponseHandler.handleResponse(error)
            Toaster.updateLoadingToast('error', 'Cập nhật trạng thái thất bại', () => {})
        } finally {
            fetchPayments()
            Toaster.dismissLoadingToast()
        }
    }

    const handlePaymentDelete = async (paymentId) => {
        Toaster.loadingToast('Đang xóa thanh toán...')
        try {
            const result = await PaymentService.deletePayment(paymentId)
            if (result.data.code === 200) {
                Toaster.updateLoadingToast('success', 'Xóa thanh toán thành công', () => {})
            }
        } catch (error) {
            ResponseHandler.handleResponse(error)
            Toaster.updateLoadingToast('error', 'Xóa thanh toán thất bại', () => {})
        } finally {
            fetchPayments()
            Toaster.dismissLoadingToast()
        }
    }

    const generatePDF = () => {
        Toaster.loadingToast('Đang tạo PDF...')
        try {
            const paymentHeaders = [
                { header: 'STT', dataKey: 'id' },
                { header: 'Đơn hàng', dataKey: 'orderNumber' },
                { header: 'Khách hàng', dataKey: 'customer' },
                { header: 'Phương thức', dataKey: 'method' },
                { header: 'Số tiền', dataKey: 'amount' },
                { header: 'Trạng thái', dataKey: 'status' },
                { header: 'Ngày thanh toán', dataKey: 'date' }
            ]
            
            const formattedPayments = payments.map((payment, index) => ({
                id: index + 1,
                orderNumber: `#${payment.orderNumber}`,
                customer: payment.customerName,
                method: payment.paymentMethod,
                amount: `$${payment.amount}`,
                status: payment.status,
                date: new Date(payment.paymentDate).toLocaleDateString('vi-VN')
            }))
            
            Toaster.updateLoadingToast('success', 'Đang tạo PDF cho bạn', () => {})
            PdfGenerator.generatePdf(formattedPayments, "Danh sách thanh toán", paymentHeaders)
        } catch (error) {
            Toaster.updateLoadingToast('error', 'Tạo PDF thất bại', () => {})
        } finally {
            Toaster.dismissLoadingToast()
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const filteredPayments = payments.filter(payment => 
        payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderNumber?.toString().includes(searchTerm) ||
        payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        fetchPayments()
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
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title fw-semibold">Danh sách thanh toán</h5>
                                    <form className="position-relative">
                                        <input 
                                            type="text" 
                                            className="form-control search-chat py-2 ps-5" 
                                            id="text-srh" 
                                            placeholder="Tìm kiếm" 
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                        <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 text-dark ms-3" />
                                    </form>
                                </div>
                                <div className="table-responsive">
                                    <PaymentTable 
                                        payments={filteredPayments} 
                                        loading={loading} 
                                        handleStatusUpdate={handleStatusUpdate}
                                        handlePaymentDelete={handlePaymentDelete}
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
