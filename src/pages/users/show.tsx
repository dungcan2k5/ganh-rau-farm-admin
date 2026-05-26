import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography, Tag } from "antd";

const { Title, Text } = Typography;

export const UserShow = () => {
    const { query } = useShow({});
    const { data, isLoading } = query;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>ID</Title>
            <Text>{record?.id}</Text>

            <Title level={5}>Full Name</Title>
            <Text>{record?.full_name}</Text>

            <Title level={5}>Email</Title>
            <Text>{record?.email}</Text>

            <Title level={5}>Phone</Title>
            <Text>{record?.phone}</Text>

            <Title level={5}>Address</Title>
            <Text>{record?.address}</Text>

            <Title level={5}>Role</Title>
            <Tag color={record?.role === 'admin' ? "gold" : "blue"}>{record?.role}</Tag>

            <Title level={5}>Created At</Title>
            <Text>{record?.created_at ? new Date(record.created_at).toLocaleString() : ''}</Text>

            <Title level={5}>Updated At</Title>
            <Text>{record?.updated_at ? new Date(record.updated_at).toLocaleString() : ''}</Text>
        </Show>
    );
};
