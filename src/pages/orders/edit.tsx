import { Edit, useForm } from "@refinedev/antd";
import { Form, Select, Input } from "antd";

export const OrderEdit = () => {
    const { formProps, saveButtonProps } = useForm({});

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Status"
                    name="status"
                >
                    <Select
                        options={[
                            { label: "Pending", value: "pending" },
                            { label: "Processing", value: "processing" },
                            { label: "Shipped", value: "shipped" },
                            { label: "Delivered", value: "delivered" },
                            { label: "Cancelled", value: "cancelled" },
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label="Shipping Address"
                    name="shipping_address"
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                    label="Receiver Phone"
                    name="receiver_phone"
                >
                    <Input />
                </Form.Item>
            </Form>
        </Edit>
    );
};
