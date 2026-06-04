import React from "react";
import { List, useTable, EditButton, ShowButton, useSelect } from "@refinedev/antd";
import { Table, Space, Select } from "antd";
import { useUpdate } from "@refinedev/core";

export const OrderList = () => {
    const { tableProps } = useTable({
        syncWithLocation: true,
        sorters: {
            initial: [
                {
                    field: "id",
                    order: "desc",
                },
            ],
        },
    });

    const { mutate } = useUpdate();

    const { selectProps: userSelectProps } = useSelect({
        resource: "users",
        optionLabel: "full_name",
        optionValue: "id",
    });

    const getUserName = (id: string) => {
        const option = userSelectProps.options?.find((opt) => opt.value === id);
        return option?.label || id;
    };

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

    const handleStatusChange = (id: number, newStatus: string) => {
        mutate({
            resource: "orders",
            id,
            values: {
                status: newStatus,
            },
            successNotification: () => ({
                message: "Cập nhật trạng thái thành công",
                description: `Đơn hàng #${id} đã được chuyển sang trạng thái mới.`,
                type: "success",
            }),
        });
    };

    return (
        <List title="Quản lý Đơn hàng">
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="Mã Đơn" render={(id) => <strong>#{id}</strong>} />
                <Table.Column 
                    dataIndex="user_id" 
                    title="Khách Hàng" 
                    render={(value) => getUserName(value)}
                />
                <Table.Column dataIndex="final_amount" title="Tổng Tiền" render={(value) => <span style={{ fontWeight: "bold", color: "#3f8600" }}>{Number(value).toLocaleString()} ₫</span>} />
                <Table.Column 
                    dataIndex="status" 
                    title="Trạng Thái" 
                    render={(value, record: any) => {
                        const statusVal = value || "pending";
                        const styles = getStatusStyles(statusVal);
                        return (
                            <Select
                                variant="borderless"
                                bordered={false}
                                value={statusVal}
                                onChange={(val) => handleStatusChange(record.id, val)}
                                size="small"
                                style={{ 
                                    backgroundColor: styles.bg, 
                                    borderRadius: "12px",
                                    width: 140,
                                    textAlign: "center",
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
                        );
                    }}
                />
                <Table.Column dataIndex="created_at" title="Ngày Đặt" render={(value) => new Date(value).toLocaleString("vi-VN")} />
                <Table.Column
                    title="Hành động"
                    dataIndex="actions"
                    render={(_, record: any) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
