import mongoose from "mongoose";
import Product from "./Model/Product.js";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

// Dữ liệu mẫu sản phẩm điện thoại
const phoneSamples = [
  {
    name: "iPhone 15 Pro Max",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/iphone15promax_natural_titanium_qcrmvd.jpg",
    price: 32900000,
    color: "Titanium tự nhiên",
    discount: 5,
    description: "iPhone 15 Pro Max - phiên bản cao cấp nhất của Apple với chip A17 Pro, camera 48MP, khung viền titan, màn hình 6.7 inch Super Retina XDR với ProMotion và Dynamic Island. Hỗ trợ quay video 4K@60fps và chụp macro, cổng USB-C, hỗ trợ sạc nhanh và khả năng kháng nước IP68.",
    stock: "in stock",
    pieces: 50,
    category: "Apple",
    review: [
      {
        email: "user1@example.com",
        text: "Chiếc điện thoại tuyệt vời nhất tôi từng sử dụng, camera chụp đẹp không thể tin được!",
        stars: 5
      },
      {
        email: "user2@example.com",
        text: "Pin trâu, màn hình đẹp, nhưng giá hơi cao so với các đối thủ.",
        stars: 4
      }
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/s24ultra_titanium_black_mznfb4.jpg",
    price: 29990000,
    color: "Titanium đen",
    discount: 8,
    description: "Samsung Galaxy S24 Ultra là flagship mới nhất của Samsung với khung titanium chắc chắn, màn hình Dynamic AMOLED 2X 6.8 inch, bút S-Pen tích hợp, vi xử lý Snapdragon 8 Gen 3, hệ thống camera 200MP cùng nhiều tính năng AI mới như Circle to Search và AI Translation. Pin 5000mAh cùng chuẩn kháng nước IP68 và cổng sạc USB-C tốc độ cao.",
    stock: "in stock",
    pieces: 45,
    category: "Samsung",
    review: [
      {
        email: "user3@example.com",
        text: "Bút S-Pen rất tiện lợi, camera zoom cực đỉnh, nhưng phần mềm hơi nặng.",
        stars: 4
      }
    ]
  },
  {
    name: "Xiaomi 14 Ultra",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/xiaomi14ultra_black_tqfpyo.jpg",
    price: 23990000,
    color: "Đen",
    discount: 10,
    description: "Xiaomi 14 Ultra là smartphone cao cấp với hệ thống camera Leica cải tiến, cảm biến 1 inch, màn hình AMOLED 6.73 inch tần số quét 144Hz, vi xử lý Snapdragon 8 Gen 3, pin 5000mAh với sạc nhanh 90W và sạc không dây 50W. Thiết kế sang trọng với khung nhôm và mặt lưng da thuộc cao cấp cùng khả năng kháng nước IP68.",
    stock: "in stock",
    pieces: 30,
    category: "Xiaomi",
    review: []
  },
  {
    name: "OPPO Find X7 Ultra",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/oppo_findx7ultra_blue_yufabq.jpg",
    price: 24990000,
    color: "Xanh",
    discount: 7,
    description: "OPPO Find X7 Ultra là flagship mới nhất của OPPO với hệ thống camera Hasselblad cải tiến gồm 4 camera 50MP, vi xử lý Dimensity 9300, màn hình AMOLED 6.8 inch với tần số quét 120Hz, pin 5000mAh hỗ trợ sạc nhanh 100W và sạc không dây 50W. Thiết kế sang trọng với mặt lưng da thuộc và khung viền kim loại cùng chứng nhận kháng nước IP68.",
    stock: "in stock",
    pieces: 25,
    category: "OPPO",
    review: []
  },
  {
    name: "Google Pixel 8 Pro",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/pixel8pro_obsidian_tjdurz.jpg",
    price: 23990000,
    color: "Obsidian",
    discount: 12,
    description: "Google Pixel 8 Pro là flagship của Google với chip Tensor G3, màn hình OLED 6.7 inch tần số quét 120Hz, hệ thống camera 50MP với nhiều tính năng AI độc quyền như Magic Eraser và Best Take. Pin 5000mAh với sạc nhanh 30W và không dây 23W, chống nước IP68 và nhận được 7 năm cập nhật phần mềm từ Google.",
    stock: "in stock",
    pieces: 20,
    category: "Google",
    review: [
      {
        email: "user4@example.com",
        text: "Camera xử lý bằng AI cực đỉnh, ảnh chụp đêm không đối thủ, nhưng thỉnh thoảng hơi lag.",
        stars: 4
      }
    ]
  },
  {
    name: "Vivo X100 Pro",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/vivox100pro_asterism_cjfyqk.jpg",
    price: 21990000,
    color: "Asterism Blue",
    discount: 8,
    description: "Vivo X100 Pro là smartphone cao cấp với camera ZEISS 50MP cảm biến 1 inch, chip MediaTek Dimensity 9300, màn hình AMOLED 6.78 inch tần số quét 120Hz, pin 5400mAh hỗ trợ sạc nhanh 100W và không dây 50W. Thiết kế sang trọng với mặt lưng phủ kính AG và khả năng kháng nước IP68.",
    stock: "in stock",
    pieces: 18,
    category: "Vivo",
    review: []
  },
  {
    name: "OnePlus 12",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/oneplus12_emerald_hvkwdg.jpg",
    price: 19990000,
    color: "Emerald Green",
    discount: 10,
    description: "OnePlus 12 là flagship mới nhất của OnePlus với vi xử lý Snapdragon 8 Gen 3, màn hình AMOLED 6.82 inch tần số quét 120Hz, camera Hasselblad thế hệ 4 với cảm biến chính 50MP, pin 5400mAh hỗ trợ sạc nhanh 100W và không dây 50W. Thiết kế cao cấp với mặt lưng kính mờ và khung viền kim loại cùng khả năng kháng nước IP68.",
    stock: "in stock",
    pieces: 22,
    category: "OnePlus",
    review: []
  },
  {
    name: "iPhone 15",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/iphone15_pink_fvwxum.jpg",
    price: 19990000,
    color: "Hồng",
    discount: 5,
    description: "iPhone 15 là mẫu iPhone mới nhất của Apple với thiết kế Dynamic Island, camera 48MP cải tiến, chip A16 Bionic mạnh mẽ, màn hình Super Retina XDR 6.1 inch, cổng USB-C, hỗ trợ sạc nhanh và khả năng kháng nước IP68. Thiết kế mặt lưng kính mờ với khung viền nhôm bền bỉ.",
    stock: "in stock",
    pieces: 40,
    category: "Apple",
    review: [
      {
        email: "user5@example.com",
        text: "Cổng USB-C rất tiện lợi, màu hồng rất đẹp, nhưng không có sạc kèm theo là điểm trừ.",
        stars: 4
      }
    ]
  },
  {
    name: "Samsung Galaxy A54",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/galaxya54_lime_drnqae.jpg",
    price: 9490000,
    color: "Lime",
    discount: 15,
    description: "Samsung Galaxy A54 là smartphone tầm trung nổi bật với màn hình Super AMOLED 6.4 inch tần số quét 120Hz, camera chính 50MP, chip Exynos 1380, pin 5000mAh hỗ trợ sạc nhanh 25W. Thiết kế hiện đại với mặt lưng kính và khung viền polycarbonate cùng khả năng kháng nước IP67.",
    stock: "in stock",
    pieces: 60,
    category: "Samsung",
    review: [
      {
        email: "user6@example.com",
        text: "Điện thoại tầm trung tốt nhất của Samsung, pin trâu, cấu hình ổn, camera chụp đẹp.",
        stars: 5
      },
      {
        email: "user7@example.com",
        text: "Máy hơi giật lag khi chơi game nặng, nhưng tổng thể vẫn tốt với mức giá này.",
        stars: 3
      }
    ]
  },
  {
    name: "Xiaomi Redmi Note 13 Pro",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/redminote13pro_black_ldtuxw.jpg",
    price: 7990000,
    color: "Đen",
    discount: 12,
    description: "Xiaomi Redmi Note 13 Pro là smartphone tầm trung với màn hình AMOLED 6.67 inch tần số quét 120Hz, camera chính 200MP, chip Snapdragon 7s Gen 2, pin 5100mAh hỗ trợ sạc nhanh 67W. Thiết kế hiện đại với mặt lưng kính và khung viền polycarbonate cùng khả năng kháng nước IP54.",
    stock: "in stock",
    pieces: 75,
    category: "Xiaomi",
    review: [
      {
        email: "user8@example.com",
        text: "Điện thoại giá rẻ nhưng cấu hình cao, camera chụp tốt trong tầm giá. Rất đáng tiền.",
        stars: 5
      }
    ]
  },
  {
    name: "OPPO Reno 11",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/opporeno11_white_kowjmg.jpg",
    price: 9990000,
    color: "Trắng",
    discount: 8,
    description: "OPPO Reno 11 là smartphone tầm trung với màn hình AMOLED 6.7 inch tần số quét 120Hz, camera chính 50MP, chip MediaTek Dimensity 7050, pin 5000mAh hỗ trợ sạc nhanh 67W. Thiết kế sang trọng với mặt lưng kính mờ và khung viền kim loại cùng khả năng kháng nước IP54.",
    stock: "in stock",
    pieces: 50,
    category: "OPPO",
    review: []
  },
  {
    name: "Realme GT 5 Pro",
    imgUrl: "https://res.cloudinary.com/dyj6pqx6d/image/upload/v1615825165/HelaShop/products/realme_gt5pro_red_xsdcku.jpg",
    price: 16990000,
    color: "Đỏ",
    discount: 10,
    description: "Realme GT 5 Pro là flagship với vi xử lý Snapdragon 8 Gen 3, màn hình AMOLED 6.78 inch tần số quét 144Hz, camera chính 50MP cảm biến Sony, pin 5600mAh hỗ trợ sạc nhanh 100W và không dây 50W. Thiết kế hiện đại với mặt lưng da thuộc hoặc kính và khung viền kim loại cùng khả năng kháng nước IP64.",
    stock: "in stock",
    pieces: 30,
    category: "Realme",
    review: []
  }
];

// Hàm khởi tạo dữ liệu sản phẩm
const seedProducts = async () => {
  try {
    // Kết nối đến cơ sở dữ liệu
    await db();
    
    // Xóa tất cả sản phẩm hiện có
    await Product.deleteMany({});
    console.log("Đã xóa tất cả sản phẩm hiện có");
    
    // Chèn dữ liệu mẫu vào cơ sở dữ liệu
    const result = await Product.insertMany(phoneSamples);
    
    console.log(`Đã tạo thành công ${result.length} sản phẩm điện thoại mẫu!`);
    console.log(`\nDanh sách sản phẩm đã tạo:`);
    
    // Tạo bảng hiển thị sản phẩm theo thương hiệu
    const productsByBrand = {};
    
    result.forEach(product => {
      if (!productsByBrand[product.category]) {
        productsByBrand[product.category] = [];
      }
      productsByBrand[product.category].push(product);
    });
    
    // In danh sách sản phẩm theo từng thương hiệu
    console.log("\n===== DANH SÁCH SẢN PHẨM THEO THƯƠNG HIỆU =====");
    
    for (const brand in productsByBrand) {
      console.log(`\n${brand.toUpperCase()} (${productsByBrand[brand].length} sản phẩm):`);
      productsByBrand[brand].forEach((product, idx) => {
        console.log(`  ${idx + 1}. ${product.name} - ${product.price.toLocaleString('vi-VN')} VNĐ - ${product.review.length} đánh giá`);
      });
    }
    
    return {
      products: result.length
    };
    
  } catch (error) {
    console.error("Lỗi khi tạo dữ liệu sản phẩm:", error);
    throw error;
  }
};

// Export hàm seed để sử dụng trong app.js
export default seedProducts; 