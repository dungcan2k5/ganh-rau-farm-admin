import { List, useTable, EditButton, ShowButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

export const UserList = () => {
    const { tableProps } = useTable({
        syncWithLocation: true,
        sorters: {
            initial: [
                {
                    field: "created_at",
                    order: "desc",
                },
            ],
        },
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="full_name" title="Full Name" />
                <Table.Column dataIndex="email" title="Email" />
                <Table.Column dataIndex="phone" title="Phone" />
                <Table.Column 
                    dataIndex="role" 
                    title="Role" 
                    render={(value) => <Tag color={value === 'admin' ? "gold" : "blue"}>{value}</Tag>}
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
