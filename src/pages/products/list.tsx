import { List, useTable, EditButton, ShowButton, DeleteButton, useSelect } from "@refinedev/antd";
import { Table, Space, Image, Tag } from "antd";

export const ProductList = () => {
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

    const { selectProps: categorySelectProps } = useSelect({
        resource: "categories",
        optionLabel: "name",
        optionValue: "id",
    });

    const getCategoryName = (id: number) => {
        const option = categorySelectProps.options?.find((opt) => opt.value === id);
        return option?.label || id;
    };

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column 
                    dataIndex="category_id" 
                    title="Category" 
                    render={(value) => getCategoryName(value)}
                />
                <Table.Column dataIndex="price" title="Price" render={(value) => `${Number(value).toLocaleString()} ₫`} />
                <Table.Column dataIndex="stock" title="Stock" />
                <Table.Column 
                    dataIndex="image_url" 
                    title="Image" 
                    render={(value) => value ? <Image src={value} alt="product" width={50} /> : null}
                />
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
