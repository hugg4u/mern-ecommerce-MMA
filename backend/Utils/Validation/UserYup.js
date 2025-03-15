import yup from 'yup'
import vietnameseProvinces from "../../Utils/Constants/Address/Provinces.js";
import vietnameseDistricts from "../../Utils/Constants/Address/District.js";

const userType = ['user', 'admin']
const gender = ['male', 'female']
class UserYup {
    getUser = yup.object({
        // role: yup.string().oneOf(userType).required(),
        email: yup.string().email().required(),
    })
    createUser = yup.object({
        role: yup.string().oneOf(userType).required(),
        email: yup.string().email().required(),
        password: yup.string().required(),
        name: yup.string().required(),
    })
    deactivateUser = yup.object({
        email: yup.string().email().required()
    })
    updateUser = yup.object({
        role: yup.string().oneOf(userType).required(),
        email: yup.string().email().required(),
        gender: yup.string().oneOf(gender).required(),
        telephone:yup.string().matches(/^[0-9]+$/, 'Must be a number').length(9, 'Must be 9 digits').required(),
        name: yup.string().required(),
        age: yup.number().min(0, "should be a adult").required(),
    })
    updatePictureUser = yup.object({
        email:yup.string().email().required(),
        photoUrl:yup.string().required()
    })
    manipulateAddress = yup.object({
        email: yup.string().email().required(),
        address: yup.object().shape({
            district: yup.string().oneOf(vietnameseDistricts).required().lowercase(),
            province: yup.string().oneOf(vietnameseProvinces).required().lowercase(),
            city: yup.string().required(),
            street: yup.string().required(),
            postalCode: yup.number().required(),
        })
    })
    updatePassword = yup.object({
        email: yup.string().email().required(),
        password:yup.string().required()
    })
}
export default UserYup = new UserYup()