import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Image } from "antd";

export const CategoryList = () => {
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
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column 
                    dataIndex="image_url" 
                    title="Image" 
                    render={(value) => value ? <Image src={value} alt="category" width={50} /> : null}
                />
                <Table.Column dataIndex="created_at" title="Created At" render={(value) => new Date(value).toLocaleString()} />
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
