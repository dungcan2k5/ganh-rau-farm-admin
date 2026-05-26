import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const UserEdit = () => {
    const { formProps, saveButtonProps } = useForm({});

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Full Name"
                    name="full_name"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Email"
                    name="email"
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label="Phone"
                    name="phone"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Address"
                    name="address"
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                    label="Role"
                    name="role"
                >
                    <Select
                        options={[
                            { label: "Admin", value: "admin" },
                            { label: "Customer", value: "customer" },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Edit>
    );
};
