import React, { useEffect, useState } from "react";
import { useShow, useOne, useUpdate } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography, Tag, Table, Descriptions, Select, Card, Spin, message, Row, Col } from "antd";
import { supabaseClient } from "../../providers/supabase-client";

const { Title, Text } = Typography;

const getStatusStyles = (status: string) => {
    switch (status) {
        case "completed":
            return { bg: "#f6ffed", text: "#389e0d" };
        case "delivered":
            return { bg: "#f0f5ff", text: "#2f54eb" };
        case "shipped":
            return { bg: "#e6fffb", text: "#08979c" };
        case "processing":
            return { bg: "#e6f7ff", text: "#096dd9" };
        case "pending":
            return { bg: "#fffbe6", text: "#d46b08" };
        case "cancelled":
            return { bg: "#fff1f0", text: "#cf1322" };
        default:
            return { bg: "#f5f5f5", text: "#595959" };
    }
};

export const OrderShow = () => {
    const { query } = useShow({});
    const { data, isLoading } = query;
    const record = data?.data;

    const { mutate } = useUpdate();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("");

    useEffect(() => {
        if (record?.status) {
            setStatus(record.status);
        }
    }, [record?.status]);

    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [itemsLoading, setItemsLoading] = useState<boolean>(false);

    // Fetch customer details
    const { query: userQuery } = useOne({
        resource: "users",
        id: record?.user_id || "",
        queryOptions: {
            enabled: !!record?.user_id,
        },
    });
    const { data: userData, isLoading: userIsLoading } = userQuery;

    // Fetch coupon details if any
    const { query: couponQuery } = useOne({
        resource: "coupons",
        id: record?.coupon_id || "",
        queryOptions: {
            enabled: !!record?.coupon_id,
        },
    });
    const { data: couponData, isLoading: couponIsLoading } = couponQuery;

    // Fetch order items and their products when record.id is loaded
    useEffect(() => {
        if (record?.id) {
            const fetchOrderItems = async () => {
                setItemsLoading(true);
                try {
                    const { data: items, error } = await supabaseClient
                        .from("order_items")
                        .select(`
                            id,
                            quantity,
                            price_at_purchase,
                            products (
                                name,
                                unit
                            )
                        `)
                        .eq("order_id", record.id);

                    if (error) throw error;
                    setOrderItems(items || []);
                } catch (err: any) {
                    console.error("Lỗi khi tải chi tiết đơn hàng:", err);
                    message.error("Không thể tải danh sách sản phẩm: " + err.message);
                } finally {
                    setItemsLoading(false);
                }
            };

            fetchOrderItems();
        }
    }, [record?.id]);

    // Handle Inline Status Change
    const handleStatusChange = (newStatus: string) => {
        if (!record?.id) return;
        setStatus(newStatus);
        setIsUpdating(true);
        
        mutate({
            resource: "orders",
            id: record.id,
            values: {
                status: newStatus,
            },
            successNotification: () => ({
                message: "Cập nhật thành công",
                description: `Trạng thái đơn hàng #${record.id} đã chuyển sang "${newStatus}".`,
                type: "success",
            }),
        }, {
            onSettled: () => {
                setIsUpdating(false);
            },
            onError: () => {
                setStatus(record?.status || "pending");
            }
        });
    };

    // Columns for order items table
    const itemColumns = [
        {
            title: "Sản phẩm",
            key: "product_name",
            render: (_: any, item: any) => (
                <span style={{ fontWeight: 500 }}>
                    {item.products?.name || "Sản phẩm đã bị xóa hoặc ẩn"}
                </span>
            ),
        },
        {
            title: "Đơn vị tính",
            key: "product_unit",
            render: (_: any, item: any) => item.products?.unit || "-",
        },
        {
            title: "Đơn giá",
            dataIndex: "price_at_purchase",
            key: "price_at_purchase",
            render: (price: number) => `${Number(price).toLocaleString()} ₫`,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (qty: number) => <strong>x{qty}</strong>,
        },
        {
            title: "Thành tiền",
            key: "subtotal",
            align: "right" as const,
            render: (_: any, item: any) => (
                <span style={{ color: "#3f8600", fontWeight: "bold" }}>
                    {(Number(item.price_at_purchase) * Number(item.quantity)).toLocaleString()} ₫
                </span>
            ),
        },
    ];

    return (
        <Show isLoading={isLoading} title={`Đơn hàng #${record?.id || ""}`}>
            <Row gutter={[16, 16]}>
                
                {/* General Information Card */}
                <Col xs={24}>
                    <Card title="Thông tin Đơn hàng" bordered={false} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                            <Descriptions.Item label="Mã đơn hàng">
                                <strong style={{ fontSize: "15px" }}>#{record?.id}</strong>
                            </Descriptions.Item>
                            
                            <Descriptions.Item label="Khách hàng">
                                {userIsLoading ? (
                                    <Spin size="small" />
                                ) : (
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{userData?.data?.full_name || "Khách vãng lai"}</div>
                                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>{userData?.data?.email}</div>
                                    </div>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Trạng thái">
                                <Select
                                    variant="borderless"
                                    bordered={false}
                                    value={status || "pending"}
                                    onChange={handleStatusChange}
                                    loading={isUpdating}
                                    style={{ 
                                        backgroundColor: getStatusStyles(status || "pending").bg, 
                                        borderRadius: "12px",
                                        width: "100%",
                                        minWidth: "150px",
                                        padding: "2px 0"
                                    }}
                                    popupClassName="status-dropdown-popup"
                                    options={[
                                        { label: <span style={{ color: "#d46b08", fontWeight: 600 }}>Chờ xử lý</span>, value: "pending" },
                                        { label: <span style={{ color: "#096dd9", fontWeight: 600 }}>Đang xử lý</span>, value: "processing" },
                                        { label: <span style={{ color: "#08979c", fontWeight: 600 }}>Đang giao hàng</span>, value: "shipped" },
                                        { label: <span style={{ color: "#2f54eb", fontWeight: 600 }}>Đã giao hàng</span>, value: "delivered" },
                                        { label: <span style={{ color: "#389e0d", fontWeight: 600 }}>Hoàn thành</span>, value: "completed" },
                                        { label: <span style={{ color: "#cf1322", fontWeight: 600 }}>Đã hủy</span>, value: "cancelled" },
                                    ]}
                                />
                            </Descriptions.Item>

                            <Descriptions.Item label="Số điện thoại nhận">
                                <Text copyable>{record?.receiver_phone || "-"}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                                <Text>{record?.shipping_address || "-"}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Tổng tiền gốc">
                                <Text delete style={{ color: "#8c8c8c" }}>
                                    {record?.total_amount ? `${Number(record.total_amount).toLocaleString()} ₫` : '0 ₫'}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Mã giảm giá">
                                {couponIsLoading ? (
                                    <Spin size="small" />
                                ) : couponData?.data?.code ? (
                                    <Tag color="purple">{couponData.data.code}</Tag>
                                ) : (
                                    <Text type="secondary">Không sử dụng</Text>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Tổng tiền thanh toán">
                                <strong style={{ color: "#3f8600", fontSize: "16px" }}>
                                    {record?.final_amount ? `${Number(record.final_amount).toLocaleString()} ₫` : '0 ₫'}
                                </strong>
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày đặt hàng">
                                {record?.created_at ? new Date(record.created_at).toLocaleString("vi-VN") : "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Cập nhật cuối">
                                {record?.updated_at ? new Date(record.updated_at).toLocaleString("vi-VN") : "-"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Order Items Table Card */}
                <Col xs={24}>
                    <Card title="Danh sách Sản phẩm đã mua" bordered={false} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <Table
                            columns={itemColumns}
                            dataSource={orderItems}
                            rowKey="id"
                            loading={itemsLoading}
                            pagination={false}
                            summary={(pageData) => {
                                let totalQty = 0;
                                let totalSum = 0;
                                pageData.forEach(({ quantity, price_at_purchase }) => {
                                    totalQty += Number(quantity || 0);
                                    totalSum += Number(price_at_purchase || 0) * Number(quantity || 0);
                                });
                                return (
                                    <Table.Summary fixed>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={2}>
                                                <strong>Tổng số lượng mua</strong>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1} colSpan={2}>
                                                <strong>x{totalQty} sản phẩm</strong>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={2} align="right">
                                                <strong style={{ color: "#cf1322", fontSize: "15px" }}>
                                                    {totalSum.toLocaleString()} ₫
                                                </strong>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </Table.Summary>
                                );
                            }}
                        />
                    </Card>
                </Col>

            </Row>
        </Show>
    );
};
