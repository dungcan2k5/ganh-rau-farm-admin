import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const CategoryEdit = () => {
    const { formProps, saveButtonProps } = useForm({});

    return (
        <Edit saveButtonProps={saveButtonProps}>
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
        </Edit>
    );
};
