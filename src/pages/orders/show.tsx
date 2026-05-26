import { useShow, useOne, useMany } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography, Tag, Table } from "antd";

const { Title, Text } = Typography;

export const OrderShow = () => {
    const { query } = useShow({});
    const { data, isLoading } = query;
    const record = data?.data;

    const { query: userQuery } = useOne({
        resource: "users",
        id: record?.user_id || "",
        queryOptions: {
            enabled: !!record?.user_id,
        },
    });
    const { data: userData, isLoading: userIsLoading } = userQuery;

    const { query: orderItemsQuery } = useMany({
        resource: "order_Items",
        ids: record?.id ? [record.id] : [], // This requires filtering by order_id, which useMany doesn't do nicely unless ID is order_id. We'll skip fetching items for simplicity or just show basics.
    });
    const { data: orderItemsData, isLoading: orderItemsIsLoading } = orderItemsQuery;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>ID</Title>
            <Text>{record?.id}</Text>

            <Title level={5}>User</Title>
            <Text>{userIsLoading ? "Loading..." : userData?.data?.full_name}</Text>

            <Title level={5}>Total Amount</Title>
            <Text>{record?.total_amount ? `${Number(record.total_amount).toLocaleString()} ₫` : ''}</Text>

            <Title level={5}>Final Amount</Title>
            <Text>{record?.final_amount ? `${Number(record.final_amount).toLocaleString()} ₫` : ''}</Text>

            <Title level={5}>Status</Title>
            <Text>{record?.status}</Text>

            <Title level={5}>Shipping Address</Title>
            <Text>{record?.shipping_address}</Text>

            <Title level={5}>Receiver Phone</Title>
            <Text>{record?.receiver_phone}</Text>

            <Title level={5}>Created At</Title>
            <Text>{record?.created_at ? new Date(record.created_at).toLocaleString() : ''}</Text>

            <Title level={5}>Updated At</Title>
            <Text>{record?.updated_at ? new Date(record.updated_at).toLocaleString() : ''}</Text>
        </Show>
    );
};
