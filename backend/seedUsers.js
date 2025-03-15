import mongoose from "mongoose";
import User from "./Model/User.js";
import Product from "./Model/Product.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

// Dữ liệu mẫu người dùng
const userSamples = [
  {
    name: "Nguyễn Văn A",
    email: "user1@gmail.com",
    password: "Pass0word",
    telephone: 901234567,
    gender: "male",
    age: 28,
    isVerfied: true,
    isActive: true,
    role: "user",
    photoUrl: "https://avatars.githubusercontent.com/u/54225118?v=4",
    address: {
      district: "quận 1",
      province: "hồ chí minh",
      country: "việt nam",
      city: "hồ chí minh",
      street: "29 Nguyễn Văn Trỗi",
      postalCode: 70000
    }
  },
  {
    name: "Trần Thị B",
    email: "user2@gmail.com",
    password: "Pass0word",
    telephone: 902345678,
    gender: "female",
    age: 24,
    isVerfied: true,
    isActive: true,
    role: "user",
    photoUrl: "https://avatars.githubusercontent.com/u/22358125?v=4",
    address: {
      district: "quận 3",
      province: "hồ chí minh",
      country: "việt nam",
      city: "hồ chí minh",
      street: "45 Lê Lợi",
      postalCode: 70000
    }
  },
  {
    name: "Lê Minh C",
    email: "user3@gmail.com",
    password: "Pass0word",
    telephone: 903456789,
    gender: "male",
    age: 32,
    isVerfied: true,
    isActive: true,
    role: "user",
    photoUrl: "https://avatars.githubusercontent.com/u/98579886?v=4",
    address: {
      district: "quận hoàn kiếm",
      province: "hà nội",
      country: "việt nam",
      city: "hà nội",
      street: "78 Trần Hưng Đạo",
      postalCode: 10000
    }
  },
  {
    name: "Phạm Thị D",
    email: "user4@gmail.com",
    password: "Pass0word",
    telephone: 904567890,
    gender: "female",
    age: 29,
    isVerfied: true,
    isActive: true,
    role: "user",
    photoUrl: "https://avatars.githubusercontent.com/u/17646305?v=4",
    address: {
      district: "quận gò vấp",
      province: "hồ chí minh",
      country: "việt nam",
      city: "hồ chí minh",
      street: "123 Nguyễn Huệ",
      postalCode: 70000
    }
  },
  {
    name: "Hoàng Văn E",
    email: "user5@gmail.com",
    password: "Pass0word",
    telephone: 905678901,
    gender: "male",
    age: 35,
    isVerfied: true,
    isActive: true,
    role: "user",
    photoUrl: "https://avatars.githubusercontent.com/u/54225118?v=4",
    address: {
      district: "quận hai bà trưng",
      province: "hà nội",
      country: "việt nam",
      city: "hà nội",
      street: "56 Lý Tự Trọng",
      postalCode: 10000
    }
  },
  {
    name: "Vũ Thị F",
    email: "user6@gmail.com",
    password: "Pass0word",
    telephone: 906789012,
    gender: "female",
    age: 27,
    isVerfied: true,
    isActive: true,
    role: "user",
    photoUrl: "https://avatars.githubusercontent.com/u/22358125?v=4",
    address: {
      district: "quận 5",
      province: "hồ chí minh",
      country: "việt nam",
      city: "hồ chí minh",
      street: "89 Trần Phú",
      postalCode: 70000
    }
  },
  {
    name: "Đặng Văn G",
    email: "user7@gmail.com",
    password: "Pass0word",
    telephone: 907890123,
    gender: "male",
    age: 31,
    isVerfied: true,
    isActive: true,
    role: "user",
    photoUrl: "https://avatars.githubusercontent.com/u/98579886?v=4",
    address: {
      district: "quận tây hồ",
      province: "hà nội",
      country: "việt nam",
      city: "hà nội",
      street: "147 Võ Thị Sáu",
      postalCode: 10000
    }
  },
  {
    name: "Bùi Thị H",
    email: "user8@gmail.com",
    password: "Pass0word",
    telephone: 908901234,
    gender: "female",
    age: 26,
    isVerfied: true,
    isActive: true,
    role: "user",
    photoUrl: "https://avatars.githubusercontent.com/u/17646305?v=4",
    address: {
      district: "quận bình thạnh",
      province: "hồ chí minh",
      country: "việt nam",
      city: "hồ chí minh",
      street: "258 Nguyễn Đình Chiểu",
      postalCode: 70000
    }
  }
];

// Dữ liệu đánh giá sản phẩm
const reviewsMapping = [
  {
    productName: "iPhone 15 Pro Max",
    reviews: [
      {
        email: "user1@gmail.com",
        text: "Chiếc điện thoại tuyệt vời nhất tôi từng sử dụng, camera chụp đẹp không thể tin được!",
        stars: 5
      },
      {
        email: "user2@gmail.com",
        text: "Pin trâu, màn hình đẹp, nhưng giá hơi cao so với các đối thủ.",
        stars: 4
      }
    ]
  },
  {
    productName: "Samsung Galaxy S24 Ultra",
    reviews: [
      {
        email: "user3@gmail.com",
        text: "Bút S-Pen rất tiện lợi, camera zoom cực đỉnh, nhưng phần mềm hơi nặng.",
        stars: 4
      }
    ]
  },
  {
    productName: "Google Pixel 8 Pro",
    reviews: [
      {
        email: "user4@gmail.com",
        text: "Camera xử lý bằng AI cực đỉnh, ảnh chụp đêm không đối thủ, nhưng thỉnh thoảng hơi lag.",
        stars: 4
      }
    ]
  },
  {
    productName: "iPhone 15",
    reviews: [
      {
        email: "user5@gmail.com",
        text: "Cổng USB-C rất tiện lợi, màu hồng rất đẹp, nhưng không có sạc kèm theo là điểm trừ.",
        stars: 4
      }
    ]
  },
  {
    productName: "Samsung Galaxy A54",
    reviews: [
      {
        email: "user6@gmail.com",
        text: "Điện thoại tầm trung tốt nhất của Samsung, pin trâu, cấu hình ổn, camera chụp đẹp.",
        stars: 5
      },
      {
        email: "user7@gmail.com",
        text: "Máy hơi giật lag khi chơi game nặng, nhưng tổng thể vẫn tốt với mức giá này.",
        stars: 3
      }
    ]
  },
  {
    productName: "Xiaomi Redmi Note 13 Pro",
    reviews: [
      {
        email: "user8@gmail.com",
        text: "Điện thoại giá rẻ nhưng cấu hình cao, camera chụp tốt trong tầm giá. Rất đáng tiền.",
        stars: 5
      }
    ]
  }
];

// Hàm khởi tạo dữ liệu người dùng và đánh giá
const seedUsersAndReviews = async () => {
  try {
    // Kết nối đến cơ sở dữ liệu
    await db();
    
    // Xóa tất cả người dùng hiện có (trừ admin)
    await User.deleteMany({ role: 'user' });
    console.log("Đã xóa tất cả tài khoản người dùng hiện có");
    
    // Mã hóa mật khẩu và tạo người dùng
    const hashedUsers = [];
    for (const user of userSamples) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      hashedUsers.push({
        ...user,
        password: hashedPassword
      });
    }
    
    // Chèn dữ liệu người dùng vào cơ sở dữ liệu
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Đã tạo thành công ${createdUsers.length} tài khoản người dùng`);
    
    // Xóa tất cả đánh giá khỏi sản phẩm
    console.log("Đang cập nhật đánh giá sản phẩm...");
    
    // Lấy tất cả sản phẩm
    const products = await Product.find({});
    
    // Cập nhật đánh giá cho từng sản phẩm
    for (const product of products) {
      // Tìm đánh giá tương ứng với sản phẩm này
      const productReviewMapping = reviewsMapping.find(
        mapping => mapping.productName === product.name
      );
      
      // Nếu có đánh giá, cập nhật sản phẩm
      if (productReviewMapping) {
        await Product.findByIdAndUpdate(
          product._id,
          { review: productReviewMapping.reviews }
        );
        console.log(`Đã cập nhật ${productReviewMapping.reviews.length} đánh giá cho sản phẩm: ${product.name}`);
      }
    }
    
    // In thông tin người dùng đã tạo
    console.log("\n===== DANH SÁCH NGƯỜI DÙNG ĐÃ TẠO =====");
    createdUsers.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name} (${user.email}) - Mật khẩu: Pass0word`);
    });
    
    // In thông tin đánh giá đã tạo
    console.log("\n===== THỐNG KÊ ĐÁNH GIÁ =====");
    let totalReviews = 0;
    reviewsMapping.forEach(mapping => {
      totalReviews += mapping.reviews.length;
      console.log(`${mapping.productName}: ${mapping.reviews.length} đánh giá`);
    });
    console.log(`\nTổng cộng: ${totalReviews} đánh giá từ ${createdUsers.length} người dùng`);
    
    return {
      users: createdUsers.length,
      reviews: totalReviews
    };
    
  } catch (error) {
    console.error("Lỗi khi tạo dữ liệu người dùng và đánh giá:", error);
    throw error;
  }
};

// Export hàm seed để sử dụng trong app.js
export default seedUsersAndReviews; 