import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography, Tag } from "antd";

const { Title, Text } = Typography;

export const CouponShow = () => {
    const { query } = useShow({});
    const { data, isLoading } = query;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>ID</Title>
            <Text>{record?.id}</Text>

            <Title level={5}>Code</Title>
            <Text>{record?.code}</Text>

            <Title level={5}>Discount Type</Title>
            <Text>{record?.discount_type}</Text>

            <Title level={5}>Discount Value</Title>
            <Text>{record?.discount_value}</Text>

            <Title level={5}>Min Order Value</Title>
            <Text>{record?.min_order_value}</Text>

            <Title level={5}>Max Discount Amount</Title>
            <Text>{record?.max_discount_amount}</Text>

            <Title level={5}>Usage Limit</Title>
            <Text>{record?.usage_limit}</Text>

            <Title level={5}>Valid Until</Title>
            <Text>{record?.valid_until ? new Date(record.valid_until).toLocaleString() : ''}</Text>

            <Title level={5}>Active</Title>
            <Tag color={record?.is_active ? "green" : "red"}>{record?.is_active ? "Yes" : "No"}</Tag>
            
            <Title level={5}>Created At</Title>
            <Text>{record?.created_at ? new Date(record.created_at).toLocaleString() : ''}</Text>

            <Title level={5}>Updated At</Title>
            <Text>{record?.updated_at ? new Date(record.updated_at).toLocaleString() : ''}</Text>
        </Show>
    );
};
