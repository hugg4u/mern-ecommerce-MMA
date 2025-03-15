import yup from 'yup'

class BannerYup{
    getBanner = yup.object({
        bid: yup.string().required(),
    })
    
    addBanner = yup.object({
        title: yup.string().required(),
        description: yup.string(),
        order: yup.number().default(0),
        isActive: yup.boolean().default(true),
    })
    
    deleteBanner = yup.object({
        bid: yup.string().required(),
    })
    
    updateBanner = yup.object({
        bid: yup.string().required(),
        title: yup.string(),
        description: yup.string(),
        imageUrl: yup.string(),
        order: yup.number(),
        isActive: yup.boolean(),
    })
    
    uploadBannerImage = yup.object({
        bid: yup.string(),
        image: yup.string().required(),
    })
}

export default new BannerYup() 