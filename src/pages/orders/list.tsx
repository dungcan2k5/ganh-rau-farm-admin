import { List, useTable, EditButton, ShowButton, useSelect } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

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

    const { selectProps: userSelectProps } = useSelect({
        resource: "users",
        optionLabel: "full_name",
        optionValue: "id",
    });

    const getUserName = (id: string) => {
        const option = userSelectProps.options?.find((opt) => opt.value === id);
        return option?.label || id;
    };

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column 
                    dataIndex="user_id" 
                    title="User" 
                    render={(value) => getUserName(value)}
                />
                <Table.Column dataIndex="final_amount" title="Amount" render={(value) => `${Number(value).toLocaleString()} ₫`} />
                <Table.Column 
                    dataIndex="status" 
                    title="Status" 
                    render={(value) => {
                        let color = "blue";
                        if (value === "pending") color = "orange";
                        if (value === "completed" || value === "delivered") color = "green";
                        if (value === "cancelled") color = "red";
                        return <Tag color={color}>{value}</Tag>;
                    }}
                />
                <Table.Column dataIndex="created_at" title="Created At" render={(value) => new Date(value).toLocaleString()} />
                <Table.Column
                    title="Actions"
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
