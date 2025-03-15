import yup from 'yup'
import vietnameseProvinces from "../../Utils/Constants/Address/Provinces.js";
import vietnameseDistricts from "../../Utils/Constants/Address/District.js";


class AddressYup {
    getAddress = yup.object({
        email: yup.string().email().required(),
    })
    addAddress = yup.object({
        email: yup.string().email().required(),
        district: yup.string().lowercase().required().oneOf(vietnameseDistricts),
        province: yup.string().lowercase().required().oneOf(vietnameseProvinces),
        // country: yup.string().required(),
        postalCode: yup.number().required(),
        // zipCode: yup.string(),
        street: yup.string().required(),
        city: yup.string().required(),
    })
    updateAddress = yup.object({
        email: yup.string().email().required(),
        district: yup.string().lowercase().required().oneOf(vietnameseDistricts),
        province: yup.string().lowercase().required().oneOf(vietnameseProvinces),
        country: yup.string().required(),
        postalCode: yup.number().required(),
        zipCode: yup.string(),
        street: yup.string().required(),
        city: yup.string().required(),
    })
}
export default AddressYup = new AddressYup()