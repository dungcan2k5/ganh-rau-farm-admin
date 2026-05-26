import { Create, useForm, useSelect } from "@refinedev/antd";
import {
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    Upload,
    Button,
    message,
    Image,
} from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";

import { supabaseClient } from "../../providers/supabase-client";

import { useSupabaseUpload } from "../../hooks/useSupabaseUpload";

export const ProductCreate = () => {
    const { formProps, saveButtonProps } = useForm({});

    const form = formProps.form;

    const { selectProps: categorySelectProps } = useSelect({
        resource: "categories",
        optionLabel: "name",
        optionValue: "id",
    });

    const {
        fileList,
        setFileList,
        beforeUpload,
        handleRemove,
        handlePaste,
        previewOpen,
        setPreviewOpen,
        previewImage,
        setPreviewImage,
        handlePreview,
        uploadToSupabase,
        deleteFromSupabase,
    } = useSupabaseUpload(form);

    const handleOnFinish = async (values: any) => {
        try {
            message.loading({
                content: "Đang xử lý dữ liệu và ảnh...",
                key: "saving",
            });
            let finalImageUrl = values.image_url;

            // 1. Kiểm tra xem có ảnh mới được chọn không (ảnh mới sẽ có originFileObj)
            const currentFile = fileList[0];
            const isNewFile = currentFile && currentFile.originFileObj;

            if (isNewFile) {
                // Đẩy ảnh mới lên Supabase
                finalImageUrl = await uploadToSupabase(
                    currentFile.originFileObj,
                );
                values.image_url = finalImageUrl; // Cập nhật lại link mới vào data gửi đi
            }

            // 3. Đưa data cuối cùng cho Refine lưu vào DB
            if (formProps.onFinish) {
                await formProps.onFinish(values);
                message.success({
                    content: "Lưu thành công, sạch sẽ không rác!",
                    key: "saving",
                });
            }
        } catch (error: any) {
            console.error(error);
            message.error({
                content: "Lỗi quá trình lưu: " + error.message,
                key: "saving",
            });
        }
    };

    return (
        <Create saveButtonProps={saveButtonProps}>
            <div onPaste={handlePaste}>
                <Form
                    {...formProps}
                    onFinish={handleOnFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Category"
                        name="category_id"
                        rules={[{ required: true }]}
                    >
                        <Select {...categorySelectProps} />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        label="Stock"
                        name="stock"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        label="Unit"
                        name="unit"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Image URL" name="image_url" hidden>
                        <Input />
                    </Form.Item>

                    {/* UI Upload */}
                    <Form.Item label="Upload Product Images">
                        <Upload.Dragger
                            beforeUpload={beforeUpload}
                            onRemove={handleRemove}
                            onPreview={handlePreview}
                            maxCount={1}
                            accept="image/*"
                            listType="picture-card"
                            fileList={fileList}
                            // Bỏ cái onChange đi vì beforeUpload và handleRemove tự quản lý fileList rồi
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                                Nhấp, Kéo thả, hoặc <b>Ctrl + V</b> ảnh mới
                            </p>
                        </Upload.Dragger>
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
            </div>
            {previewImage && (
                <Image
                    wrapperStyle={{ display: "none" }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        // Đã sửa lại thành setPreviewImage ở dòng dưới
                        afterOpenChange: (visible) =>
                            !visible && setPreviewImage(""),
                    }}
                    src={previewImage}
                />
            )}
        </Create>
    );
};
