import { useState } from "react";
import { message } from "antd";
import { supabaseClient } from "../providers/supabase-client";

// Hàm hỗ trợ chuyển file thành dạng base64 để xem trước tạm thời
const getBase64 = (file: any): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

// Hook này nhận vào instance của form và tên trường muốn lưu link ảnh (mặc định là image_url)
export const useSupabaseUpload = (form: any, fieldName: string = "image_url") => {
    const [fileList, setFileList] = useState<any[]>([]);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    const beforeUpload = (file: any) => {
        getBase64(file).then((previewUrl) => {
            setFileList([{
                uid: file.uid || "-2",
                name: file.name,
                status: "done",
                originFileObj: file,
                url: previewUrl
            }]);
        });
        return false;
    }

    const handleRemove = () => {
        setFileList([]);
        if (form) {
            form.setFieldValue(fieldName, "");
        }
    }


    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            setFileList([{ uid: file.uid || "-2", name: file.name, status: "uploading" }]);

            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabaseClient.storage
                .from("images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabaseClient.storage.from("images").getPublicUrl(filePath);

            if (form) {
                form.setFieldValue(fieldName, publicUrl);
            }

            setFileList([
                { uid: file.uid || "-2", name: file.name, status: "done", url: publicUrl },
            ]);

            if (onSuccess) onSuccess("ok");
            message.success("Tải ảnh lên thành công!");
        } catch (error: any) {
            console.error(error);
            setFileList([{ uid: file.uid || "-2", name: file.name, status: "error" }]);
            if (onError) onError(error);
            message.error("Lỗi tải ảnh!\n" + error.message);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const clipboardFiles = e.clipboardData.files;
        if (clipboardFiles.length > 0) {
            const file = clipboardFiles[0];
            if (file.type.startsWith("image/")) {
                e.preventDefault();
                handleUpload({ file });
            } else {
                message.warning("Nội dung được dán phải là ảnh");
            }
        }
    };

    const uploadToSupabase = async (fileToUpload: File) => {
        const fileExt = fileToUpload.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabaseClient.storage.from("images").upload(filePath, fileToUpload);
        if (error) throw error;

        const { data: { publicUrl } } = supabaseClient.storage.from("images").getPublicUrl(filePath);
        return publicUrl;
    };

    const deleteFromSupabase = async (oldUrl: string) => {
        if (!oldUrl) return;
        // Bóc tách tên file từ cái link dài ngoằng
        const pathParts = oldUrl.split('/images/');
        if (pathParts.length > 1) {
            const filePath = pathParts[1];
            await supabaseClient.storage.from('images').remove([filePath]);
        }
    };

    const handlePreview = async (file: any) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview as string);
        setPreviewOpen(true);
    };



    return {
        fileList, setFileList, beforeUpload, handleRemove, handlePaste, previewOpen, setPreviewOpen, previewImage, setPreviewImage, handlePreview, uploadToSupabase, deleteFromSupabase
    };
};