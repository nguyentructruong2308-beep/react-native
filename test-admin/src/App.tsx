import { Admin, Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { Dashboard } from "./component/Dashboard";

// Icons
import CategoryIcon from '@mui/icons-material/Category';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; 
import DiscountIcon from '@mui/icons-material/Discount'; // Icon cho Voucher

// Components
import { CategoryList, CategoryCreate, CategoryEdit } from "./component/category/Category";
import { ProductList, ProductCreate, ProductEdit } from "./component/product/Product";
import { UserList } from "./component/user/User";
import { OrderList, OrderEdit } from "./component/order/Order";
import { CartList, CartEdit } from "./component/cart/Cart"; 
import { VoucherList, VoucherCreate, VoucherEdit } from "./component/voucher/Voucher";
import ProductImageUpdate from "./component/ProductImageUpdate";

export const App = () => (
    <Admin authProvider={authProvider} layout={Layout} dataProvider={dataProvider} dashboard={Dashboard}>
        <CustomRoutes>
             <Route path="/products/:id/update-image" element={<ProductImageUpdate />} />
        </CustomRoutes>
        
        <Resource name="categories" list={CategoryList} create={CategoryCreate} edit={CategoryEdit} icon={CategoryIcon} />
        <Resource name="products" list={ProductList} create={ProductCreate} edit={ProductEdit} icon={Inventory2Icon} />
        <Resource name="users" list={UserList} icon={GroupIcon} />
        <Resource name="orders" list={OrderList} edit={OrderEdit} icon={ReceiptIcon} />
        
        {/* Resource mới cho Giỏ hàng */}
        {/* name="carts" sẽ tương ứng với endpoint gọi API (ví dụ: /api/carts hoặc /api/admin/carts tùy config dataProvider) */}
        <Resource name="carts" list={CartList} edit={CartEdit} icon={ShoppingCartIcon} />
        <Resource name="vouchers" list={VoucherList} create={VoucherCreate} edit={VoucherEdit} icon={DiscountIcon} />

    </Admin>
);