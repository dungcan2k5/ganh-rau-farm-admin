import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const CategoryCreate = () => {
    const { formProps, saveButtonProps } = useForm({});

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Image URL"
                    name="image_url"
                >
                    <Input />
                </Form.Item>
            </Form>
        </Create>
    );
};
