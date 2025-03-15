import Express from "express";
const app = Express();
import dotenv from "dotenv"
dotenv.config();

import cors from "cors";
import db from "./db.js"
import logger from "./MiddleWare/LogEvents.js"
import corsConfig from "./Config/CorsConfig.js"
import createAdminUser from "./seedAdmin.js";
import seedProducts from "./seedProducts.js";
import seedUsersAndReviews from "./seedUsers.js";
import seedBanner from "./seedBanner.js";
const PORT = process.env.PORT || 9999

app.use(cors(corsConfig));
app.use(Express.json({ limit: '50mb' }));
app.use(Express.urlencoded({ limit: '50mb', extended: true }));
//below consist some issues when runing in deployement env
app.use(logger);

// import routes
import AuthRoute from './Routes/Auth/AuthRoute.js'
import response from "./Utils/Constants/Response.js";
import ProductRoute from './Routes/Product/ProductRoute.js'
import AddressRoute from './Routes/Profile/Address/AddressRoute.js'
import StaffRoute from './Routes/Staff/StaffRoute.js'
import UserRoute from './Routes/Profile/User/UserRoute.js'
import CartRoute from './Routes/Cart/CartRoute.js'
import BannerRoute from './Routes/Banner/BannerRoute.js'

// routes definition starts here
app.get("/", (req, res) => {
    return response(res,200,"Server Online")
})
app.use('/api/v1/auth', AuthRoute)
app.use('/api/v1/product',ProductRoute)
app.use('/api/v1/user/address',AddressRoute)
app.use('/api/v1/staff',StaffRoute)
app.use('/api/v1/user',UserRoute)
app.use('/api/v1/cart',CartRoute)
app.use('/api/v1/banner',BannerRoute)

//db connction
db().then(() => {
    // Khởi tạo tài khoản admin sau khi kết nối cơ sở dữ liệu thành công
    // createAdminUser();
    // seedProducts();
    // seedUsersAndReviews();
    // seedBanner();
});

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
})