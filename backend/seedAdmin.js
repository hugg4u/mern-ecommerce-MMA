import mongoose from "mongoose";
import User from "./Model/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const createAdminUser = async () => {
  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const adminExists = await User.findOne({ email: "admin@gmail.com" });
    
    if (adminExists) {
      console.log("Admin đã tồn tại, không cần tạo mới");
      return;
    }
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin@123", salt);
    
    // Tạo tài khoản admin
    const admin = new User({
      name: "Admin",
      email: "admin@gmail.com",
      telephone: 1234567890,
      gender: "male",
      password: hashedPassword,
      age: 30,
      isVerfied: true,
      isActive: true,
      role: "admin",
      address: {
      district: "quận bình thạnh",
      province: "hồ chí minh",
      country: "việt nam",
      city: "hồ chí minh",
      street: "258 Nguyễn Đình Chiểu",
      postalCode: 70000
    }
    });
    
    await admin.save();
    console.log("Tài khoản admin đã được tạo thành công!");
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản admin:", error);
  }
};

export default createAdminUser;