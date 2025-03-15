import mongoose from "mongoose";
import Banner from "./Model/Banner.js";
import dotenv from "dotenv";
dotenv.config();

const createSeedBanners = async () => {
  try {
    // Kiểm tra xem đã có banner nào chưa
    const bannerCount = await Banner.countDocuments({});
    
    if (bannerCount > 0) {
      console.log("Banners đã tồn tại, không cần tạo mới");
      return;
    }

    // Dữ liệu mẫu cho banners
    const seedBanners = [
      {
        imageUrl: "https://res.cloudinary.com/dfgxkw3bn/image/upload/v1710423857/hela-shop/banners/banner1_rmhjgq.jpg",
        title: "iPhone 15 Pro Max Mới Ra Mắt",
        description: "Trải nghiệm ngay iPhone 15 Pro Max với camera 48MP và chip A17 Pro mạnh mẽ",
        isActive: true,
        order: 1
      },
      {
        imageUrl: "https://res.cloudinary.com/dfgxkw3bn/image/upload/v1710423857/hela-shop/banners/banner2_zzjgcm.jpg",
        title: "Khuyến mãi Samsung Galaxy",
        description: "Giảm giá sốc đến 30% cho dòng Samsung Galaxy S24 Ultra",
        isActive: true,
        order: 2
      },
      {
        imageUrl: "https://res.cloudinary.com/dfgxkw3bn/image/upload/v1710423857/hela-shop/banners/banner3_cdqk5h.jpg",
        title: "Flash Sale Xiaomi",
        description: "Xiaomi 14 Pro giảm giá mạnh - Chỉ trong 24h",
        isActive: true,
        order: 3
      },
      {
        imageUrl: "https://res.cloudinary.com/dfgxkw3bn/image/upload/v1710423857/hela-shop/banners/banner4_ulzrkm.jpg",
        title: "Oppo Find X7 Ultra",
        description: "Khám phá Oppo Find X7 Ultra với camera Hasselblad cực đỉnh",
        isActive: true,
        order: 4
      },
      {
        imageUrl: "https://res.cloudinary.com/dfgxkw3bn/image/upload/v1710423857/hela-shop/banners/banner5_axcsns.jpg",
        title: "Vivo V30 Pro Mới Nhất",
        description: "Vivo V30 Pro với camera selfie 50MP và sạc nhanh 80W",
        isActive: true,
        order: 5
      }
    ];

    // Tạo banners
    await Banner.insertMany(seedBanners);
    console.log("Dữ liệu mẫu banner đã được tạo thành công!");
  } catch (error) {
    console.error("Lỗi khi tạo dữ liệu mẫu banner:", error);
  }
};

export default createSeedBanners;