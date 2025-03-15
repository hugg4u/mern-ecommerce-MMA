import Express from "express";
import BannerController from "../../Controller/Banner/BannerController.js";
import validateToken from "../../MiddleWare/Auth/ValidateToken.js";
import validateScehma from "../../MiddleWare/Schema/ValidateSchema.js";
import BannerYup from "../../Utils/Validation/BannerYup.js";

const router = Express.Router();

// Route cho người dùng
router.get("/get-banners", BannerController.getBanners);

// Route cho admin
router.post("/get-banner", validateToken, validateScehma(BannerYup.getBanner), BannerController.getBanner);
router.post("/add-banner", validateToken, validateScehma(BannerYup.addBanner), BannerController.addBanner);
router.post("/delete-banner", validateToken, validateScehma(BannerYup.deleteBanner), BannerController.deleteBanner);
router.post("/update-banner", validateToken, validateScehma(BannerYup.updateBanner), BannerController.updateBanner);
router.post("/upload-banner-image", validateToken, validateScehma(BannerYup.uploadBannerImage), BannerController.uploadBannerImage);

export default router; 