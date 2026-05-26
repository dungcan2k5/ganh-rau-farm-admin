import { useShow, useOne } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography, Image, Tag } from "antd";

const { Title, Text } = Typography;

export const ProductShow = () => {
    const { query } = useShow({});
    const { data, isLoading } = query;
    const record = data?.data;

    const { query: categoryQuery } = useOne({
        resource: "categories",
        id: record?.category_id || "",
        queryOptions: {
            enabled: !!record?.category_id,
        },
    });
    const { data: categoryData, isLoading: categoryIsLoading } = categoryQuery;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>ID</Title>
            <Text>{record?.id}</Text>

            <Title level={5}>Name</Title>
            <Text>{record?.name}</Text>

            <Title level={5}>Category</Title>
            <Text>{categoryIsLoading ? "Loading..." : categoryData?.data?.name}</Text>

            <Title level={5}>Description</Title>
            <Text>{record?.description}</Text>

            <Title level={5}>Price</Title>
            <Text>{record?.price ? `${Number(record.price).toLocaleString()} ₫` : ''}</Text>

            <Title level={5}>Stock</Title>
            <Text>{record?.stock}</Text>

            <Title level={5}>Unit</Title>
            <Text>{record?.unit}</Text>

            <Title level={5}>Image</Title>
            {record?.image_url ? (
                <Image src={record?.image_url} alt="product" width={200} />
            ) : (
                <Text>No image</Text>
            )}

            <Title level={5}>Active</Title>
            <Tag color={record?.is_active ? "green" : "red"}>{record?.is_active ? "Yes" : "No"}</Tag>
            
            <Title level={5}>Created At</Title>
            <Text>{record?.created_at ? new Date(record.created_at).toLocaleString() : ''}</Text>

            <Title level={5}>Updated At</Title>
            <Text>{record?.updated_at ? new Date(record.updated_at).toLocaleString() : ''}</Text>
        </Show>
    );
};
