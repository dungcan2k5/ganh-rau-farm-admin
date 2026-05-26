import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Upload, Image, message } from "antd";

import { useSupabaseUpload } from "../../hooks/useSupabaseUpload";
import { useEffect } from "react";
import FormItem from "antd/es/form/FormItem";
import { InboxOutlined } from "@ant-design/icons";

export const ProductEdit = () => {
    const { formProps, saveButtonProps, query } = useForm({});
    const form = formProps.form;
    const productData = query?.data?.data;
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
    const { selectProps: categorySelectProps } = useSelect({
        resource: "categories",
        optionLabel: "name",
        optionValue: "id",
    });

    useEffect(() => {
        if (productData?.image_url) {
            setFileList([
                {
                    uid: "-1",
                    name: "anh-hien-tai",
                    status: "done",
                    url: productData.image_url,
                },
            ]);
        }
    }, [productData, setFileList]);

    // ĐÂY LÀ TRÁI TIM CỦA BẢN NÂNG CẤP: Chặn hàm Submit
    const handleOnFinish = async (values: any) => {
        try {
            message.loading({
                content: "Đang xử lý dữ liệu và ảnh...",
                key: "saving",
            });
            let finalImageUrl = values.image_url;
            const oldImageUrl = productData?.image_url;

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

            // 2. XOÁ RÁC: Nếu ảnh bị đổi HOẶC bị người dùng bấm xoá trắng
            if (oldImageUrl && oldImageUrl !== finalImageUrl) {
                await deleteFromSupabase(oldImageUrl);
            }

            // 3. Đưa data cuối cùng cho Refine lưu vào DB
            if (formProps.onFinish) {
                await formProps.onFinish(values);
                message.success({
                    content: "Tải ảnh lên thành công!",
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
        <Edit saveButtonProps={saveButtonProps}>
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

                    <FormItem label="Upload Product Images">
                        <Upload.Dragger
                            beforeUpload={beforeUpload}
                            onRemove={handleRemove}
                            onPreview={handlePreview}
                            maxCount={1}
                            accept="image/*"
                            listType="picture-card"
                            fileList={fileList}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                                Nhấp, Kéo thả, hoặc <b>Ctrl + V</b> ảnh mới
                            </p>
                        </Upload.Dragger>
                    </FormItem>
                    <Form.Item
                        label="Active"
                        name="is_active"
                        valuePropName="checked"
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
        </Edit>
    );
};
