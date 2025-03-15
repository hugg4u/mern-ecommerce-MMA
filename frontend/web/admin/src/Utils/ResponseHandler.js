import LocalStore from "../Store/LocalStore";
import Toaster from "./Constants/Toaster";

class ResponseHandler {
    handleResponse(error) {
        const { code, data } = error.response.data;
        switch (code) {
            case 401:
                this.handle401TokenError(data.message);
                break;
            default:
                this.handleCommonError(data.message);
        }
    }

    handle401TokenError(message) {
        Toaster.justToast('error', message, () => {
            LocalStore.removeToken();
            window.location.reload(true);
        });
    }

    handleCommonError(message) {
        Toaster.justToast('error', message, () => {
            // Xử lý lỗi chung
        });
    }

    // Hàm kiểm tra response thành công
    responseSuccess(response) {
        return response && response.code >= 200 && response.code < 300;
    }
}

export default new ResponseHandler(); 