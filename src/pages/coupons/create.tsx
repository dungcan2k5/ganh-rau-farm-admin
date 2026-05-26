import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, DatePicker } from "antd";
import dayjs from "dayjs";

export const CouponCreate = () => {
    const { formProps, saveButtonProps } = useForm({});

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Code"
                    name="code"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Discount Type"
                    name="discount_type"
                    rules={[{ required: true }]}
                >
                    <Select
                        options={[
                            { label: "Percentage", value: "percentage" },
                            { label: "Fixed Amount", value: "fixed_amount" },
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label="Discount Value"
                    name="discount_value"
                    rules={[{ required: true }]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label="Min Order Value"
                    name="min_order_value"
                >
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label="Max Discount Amount"
                    name="max_discount_amount"
                >
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label="Usage Limit"
                    name="usage_limit"
                >
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label="Valid Until"
                    name="valid_until"
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : "",
                    })}
                >
                    <DatePicker style={{ width: '100%' }} showTime />
                </Form.Item>
                <Form.Item
                    label="Active"
                    name="is_active"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Create>
    );
};
