import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

export const CouponList = () => {
    const { tableProps } = useTable({
        syncWithLocation: true,
        sorters: {
            initial: [
                {
                    field: "id",
                    order: "asc",
                },
            ],
        },
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="code" title="Code" />
                <Table.Column dataIndex="discount_type" title="Type" />
                <Table.Column dataIndex="discount_value" title="Value" />
                <Table.Column dataIndex="valid_until" title="Valid Until" render={(value) => value ? new Date(value).toLocaleDateString() : ''} />
                <Table.Column 
                    dataIndex="is_active" 
                    title="Active" 
                    render={(value) => <Tag color={value ? "green" : "red"}>{value ? "Yes" : "No"}</Tag>}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: any) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
