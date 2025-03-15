import axios from "axios";
import BaseService from "../Base/BaseService";

class PaymentService {
    constructor() {
        BaseService.getBaseURL()
        this.GET_PAYMENTS = "payment/get-payments";
        this.GET_PAYMENT_BY_ID = "payment/get-payment";
        this.UPDATE_PAYMENT_STATUS = "payment/update-status";
        this.DELETE_PAYMENT = "payment/delete-payment";
    }

    getPayments() {
        return axios.get(this.GET_PAYMENTS, BaseService.getHeader())
    }

    getPaymentById(paymentId) {
        return axios.post(this.GET_PAYMENT_BY_ID, {paymentId}, BaseService.getHeader())
    }

    updatePaymentStatus(paymentId, status) {
        const data = {
            paymentId,
            status
        }
        return axios.put(this.UPDATE_PAYMENT_STATUS, data, BaseService.getHeader())
    }

    deletePayment(paymentId) {
        return axios.post(this.DELETE_PAYMENT, {paymentId}, BaseService.getHeader())
    }
}

export default PaymentService = new PaymentService() 