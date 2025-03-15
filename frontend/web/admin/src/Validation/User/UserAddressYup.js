import * as yup from 'yup'
import vietnameseDistricts from '../../Utils/Constants/Address/District'
import vietnameseProvinces from '../../Utils/Constants/Address/Provinces'

class UserAddressYup{
    addAddress = yup.object({
        district: yup.string().lowercase().required().oneOf(vietnameseDistricts),
        province: yup.string().lowercase().required().oneOf(vietnameseProvinces),
        postalCode: yup.number().required('required'),
        street: yup.string().required(),
        city: yup.string().required(),
    })
}
export default UserAddressYup = new UserAddressYup()