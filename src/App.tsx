import { Refine, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
    AuthPage,
    ErrorComponent,
    useNotificationProvider,
    ThemedLayout,
    ThemedSider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { DashboardOutlined } from "@ant-design/icons";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
    NavigateToResource,
    CatchAllNavigate,
    UnsavedChangesNotifier,
    DocumentTitleHandler,
} from "@refinedev/react-router";
import { supabaseClient } from "./providers/supabase-client";
import { dataProvider } from "./providers/data";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import authProvider from "./providers/auth";

import {
    CategoryList,
    CategoryCreate,
    CategoryEdit,
    CategoryShow,
} from "./pages/categories";
import {
    ProductList,
    ProductCreate,
    ProductEdit,
    ProductShow,
} from "./pages/products";
import { UserList, UserEdit, UserShow } from "./pages/users";
import { OrderList, OrderEdit, OrderShow } from "./pages/orders";
import {
    CouponList,
    CouponCreate,
    CouponEdit,
    CouponShow,
} from "./pages/coupons";
import { DashboardReport } from "./pages/dashboard";

function App() {
    return (
        <BrowserRouter>
            <RefineKbarProvider>
                <ColorModeContextProvider>
                    <AntdApp>
                        <DevtoolsProvider>
                            <Refine
                                dataProvider={dataProvider}
                                liveProvider={liveProvider(supabaseClient)}
                                authProvider={authProvider}
                                routerProvider={routerProvider}
                                notificationProvider={useNotificationProvider}
                                resources={[
                                    {
                                        name: "dashboard",
                                        list: "/dashboard",
                                        meta: {
                                            label: "Dashboard",
                                            icon: <DashboardOutlined />,
                                        },
                                    },
                                    {
                                        name: "categories",
                                        list: "/categories",
                                        create: "/categories/create",
                                        edit: "/categories/edit/:id",
                                        show: "/categories/show/:id",
                                        meta: {
                                            canDelete: true,
                                        },
                                    },
                                    {
                                        name: "products",
                                        list: "/products",
                                        create: "/products/create",
                                        edit: "/products/edit/:id",
                                        show: "/products/show/:id",
                                        meta: {
                                            canDelete: true,
                                        },
                                    },
                                    {
                                        name: "users",
                                        list: "/users",
                                        edit: "/users/edit/:id",
                                        show: "/users/show/:id",
                                    },
                                    {
                                        name: "orders",
                                        list: "/orders",
                                        edit: "/orders/edit/:id",
                                        show: "/orders/show/:id",
                                    },
                                    {
                                        name: "coupons",
                                        list: "/coupons",
                                        create: "/coupons/create",
                                        edit: "/coupons/edit/:id",
                                        show: "/coupons/show/:id",
                                        meta: {
                                            canDelete: true,
                                        },
                                    },
                                ]}
                                options={{
                                    syncWithLocation: true,
                                    warnWhenUnsavedChanges: true,
                                }}
                            >
                                <Routes>
                                    <Route
                                        element={
                                            <Authenticated
                                                key="authenticated-inner"
                                                fallback={
                                                    <CatchAllNavigate to="/login" />
                                                }
                                            >
                                                <ThemedLayout
                                                    Header={Header}
                                                    Sider={(props) => (
                                                        <ThemedSider
                                                            {...props}
                                                            fixed
                                                        />
                                                    )}
                                                >
                                                    <Outlet />
                                                </ThemedLayout>
                                            </Authenticated>
                                        }
                                    >
                                        <Route
                                            index
                                            element={
                                                <NavigateToResource resource="dashboard" />
                                            }
                                        />

                                        <Route path="/categories">
                                            <Route
                                                index
                                                element={<CategoryList />}
                                            />
                                            <Route
                                                path="create"
                                                element={<CategoryCreate />}
                                            />
                                            <Route
                                                path="edit/:id"
                                                element={<CategoryEdit />}
                                            />
                                            <Route
                                                path="show/:id"
                                                element={<CategoryShow />}
                                            />
                                        </Route>

                                        <Route path="/products">
                                            <Route
                                                index
                                                element={<ProductList />}
                                            />
                                            <Route
                                                path="create"
                                                element={<ProductCreate />}
                                            />
                                            <Route
                                                path="edit/:id"
                                                element={<ProductEdit />}
                                            />
                                            <Route
                                                path="show/:id"
                                                element={<ProductShow />}
                                            />
                                        </Route>

                                        <Route path="/users">
                                            <Route
                                                index
                                                element={<UserList />}
                                            />
                                            <Route
                                                path="edit/:id"
                                                element={<UserEdit />}
                                            />
                                            <Route
                                                path="show/:id"
                                                element={<UserShow />}
                                            />
                                        </Route>

                                        <Route path="/orders">
                                            <Route
                                                index
                                                element={<OrderList />}
                                            />
                                            <Route
                                                path="edit/:id"
                                                element={<OrderEdit />}
                                            />
                                            <Route
                                                path="show/:id"
                                                element={<OrderShow />}
                                            />
                                        </Route>

                                        <Route path="/coupons">
                                            <Route
                                                index
                                                element={<CouponList />}
                                            />
                                            <Route
                                                path="create"
                                                element={<CouponCreate />}
                                            />
                                            <Route
                                                path="edit/:id"
                                                element={<CouponEdit />}
                                            />
                                            <Route
                                                path="show/:id"
                                                element={<CouponShow />}
                                            />
                                        </Route>
                                        <Route
                                            path="/dashboard"
                                            element={<DashboardReport />}
                                        />
                                        <Route
                                            path="*"
                                            element={<ErrorComponent />}
                                        />
                                    </Route>

                                    <Route
                                        element={
                                            <Authenticated
                                                key="authenticated-outer"
                                                fallback={<Outlet />}
                                            >
                                                <NavigateToResource />
                                            </Authenticated>
                                        }
                                    >
                                        <Route
                                            path="/login"
                                            element={<AuthPage type="login" />}
                                        />
                                        <Route
                                            path="/register"
                                            element={
                                                <AuthPage type="register" />
                                            }
                                        />
                                        <Route
                                            path="/forgot-password"
                                            element={
                                                <AuthPage type="forgotPassword" />
                                            }
                                        />
                                        <Route
                                            path="/update-password"
                                            element={
                                                <AuthPage type="updatePassword" />
                                            }
                                        />
                                    </Route>
                                </Routes>
                                <RefineKbar />
                                <UnsavedChangesNotifier />
                                <DocumentTitleHandler />
                            </Refine>
                            <DevtoolsPanel />
                        </DevtoolsProvider>
                    </AntdApp>
                </ColorModeContextProvider>
            </RefineKbarProvider>
        </BrowserRouter>
    );
}

export default App;
