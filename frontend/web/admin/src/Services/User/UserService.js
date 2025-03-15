import axios from "axios";
import BaseService from "../Base/BaseService";

class UserService{
    constructor() {
        BaseService.getBaseURL()
        this.GET_USER = "user/get-users";
        this.GET_USER_BY_EMAIL = "user/get-user";
        this.CREATE_USER = "user/create-user"
        this.UPLOAD_IMAGE = "user/pic-update";
        this.UPDATE_USER = "user/update-user";
        this.DELETE_USER = "user/deactivate-user";
        this.MANIPULATE_ADDERSS = "user/manipulate-user-address";
        this.UPDATE_PASSWORD = "user/update-password";
    }
    addUser(input) {
        let data = {
            name :input.name,
            email:input.email,
            password:input.password,
            role:input.role,
            telephone:input.telephone,
            gender:input.gender,
            age:input.age
        }
        return axios.post(this.CREATE_USER,data,BaseService.getHeader())
    }
    getUsers() {
        return axios.get(this.GET_USER,BaseService.getHeader())
    }
    deleteUser(email) {
        return axios.post(this.DELETE_USER,{email},BaseService.getHeader())
    }
    getUserById(email) {
        return axios.post(this.GET_USER_BY_EMAIL,{email},BaseService.getHeader())
    }
    uploadProfilePicture(input) {
        const formData = new FormData();
        formData.append('image', input.get('image'));
        return axios.post(this.UPLOAD_IMAGE, {
            image: input.get('image')
        }, BaseService.getHeader())
    }
    uploadProPicToMongo(input) {
        let data = {
            email: input.email,
            photoUrl:input.photoUrl
        }
        return axios.put(this.UPLOAD_IMAGE,data,BaseService.getHeader())
    }
    updateUser(input) {
        let data = {
            name :input.name,
            email:input.email,
            role:input.role,
            telephone:input.telephone,
            gender:input.gender,
            age: input.age,
        }
        return axios.put(this.UPDATE_USER,data,BaseService.getHeader())
    }
    manipulateAddress(email,input) {
        let data = {
            district :input.district,
            province:input.province,
            postalCode:input.postalCode,
            street:input.street,
            city:input.city
        }
        return axios.put(this.MANIPULATE_ADDERSS,{email,address:data},BaseService.getHeader())
    }
    updatePassword(email, password) {
        let data = {
            email,
            password
        }
        return axios.put(this.UPDATE_PASSWORD,data,BaseService.getHeader())
    }
}
export default UserService = new UserService()