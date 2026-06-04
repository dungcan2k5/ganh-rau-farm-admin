import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Input, InputNumber, Row, Col, message } from "antd";
import { supabaseClient } from "../../providers/supabase-client";

export const OrderEdit = () => {
    // Destructure query to get original order data (needed for old coupon refund check)
    const { formProps, saveButtonProps, query } = useForm<any>({});
    const form = formProps.form;
    const orderData = query?.data?.data;

    const { selectProps: userSelectProps } = useSelect({
        resource: "users",
        optionLabel: "email",
        optionValue: "id",
    });

    const { selectProps: couponSelectProps } = useSelect({
        resource: "coupons",
        optionLabel: "code",
        optionValue: "id",
    });

    // Reactive Coupon discount calculation
    const handleValuesChange = async (changedValues: any, allValues: any) => {
        // Run calculation when coupon_id or total_amount changes
        if (changedValues.coupon_id !== undefined || changedValues.total_amount !== undefined) {
            const couponId = allValues.coupon_id;
            const totalAmount = Number(allValues.total_amount || 0);

            if (!couponId) {
                // If coupon is cleared, final_amount = total_amount
                form?.setFieldsValue({ final_amount: totalAmount });
                return;
            }

            try {
                // Fetch details of selected coupon
                const { data: coupon, error } = await supabaseClient
                    .from("coupons")
                    .select("*")
                    .eq("id", couponId)
                    .single();

                if (error || !coupon) {
                    form?.setFieldsValue({ final_amount: totalAmount });
                    return;
                }

                const discountValue = Number(coupon.discount_value || 0);
                const minOrderValue = Number(coupon.min_order_value || 0);
                const maxDiscountAmount = Number(coupon.max_discount_amount || 0);

                let discount = 0;

                // Validate minimum order value constraint
                if (totalAmount >= minOrderValue) {
                    if (coupon.discount_type === "percentage") {
                        discount = totalAmount * (discountValue / 100);
                        if (maxDiscountAmount > 0 && discount > maxDiscountAmount) {
                            discount = maxDiscountAmount;
                        }
                    } else if (coupon.discount_type === "fixed_amount") {
                        discount = discountValue;
                    }
                } else {
                    message.warning(`Đơn hàng chưa đạt giá trị tối thiểu (${minOrderValue.toLocaleString()} ₫) để áp dụng mã này.`);
                }

                const finalAmount = Math.max(0, totalAmount - discount);
                form?.setFieldsValue({ final_amount: finalAmount });
            } catch (err: any) {
                console.error("Lỗi khi tính tiền giảm giá:", err);
            }
        }
    };

    // Form submission wrapper to manage coupon usage limits in database
    const handleOnFinish = async (values: any) => {
        const key = "saving_order_coupon";
        message.loading({
            content: "Đang kiểm tra và cập nhật đơn hàng...",
            key,
        });

        try {
            const newCouponId = values.coupon_id;
            const oldCouponId = orderData?.coupon_id;

            // Check if coupon selection has changed
            if (newCouponId !== oldCouponId) {
                // 1. If a new coupon is added, validate and decrement its usage_limit
                if (newCouponId) {
                    const { data: newCoupon, error: newCouponErr } = await supabaseClient
                        .from("coupons")
                        .select("usage_limit, code, is_active, valid_until")
                        .eq("id", newCouponId)
                        .single();

                    if (newCouponErr || !newCoupon) {
                        throw new Error("Không thể kiểm tra thông tin mã giảm giá mới.");
                    }

                    // Check active status
                    if (newCoupon.is_active === false) {
                        throw new Error(`Mã giảm giá "${newCoupon.code}" hiện đã bị vô hiệu hóa.`);
                    }

                    // Check expiration
                    if (newCoupon.valid_until && new Date(newCoupon.valid_until) < new Date()) {
                        throw new Error(`Mã giảm giá "${newCoupon.code}" đã hết hạn sử dụng.`);
                    }

                    // Check remaining usages
                    if (newCoupon.usage_limit !== null && newCoupon.usage_limit <= 0) {
                        throw new Error(`Mã giảm giá "${newCoupon.code}" đã hết lượt sử dụng.`);
                    }

                    // Decrement new coupon usage limit
                    if (newCoupon.usage_limit !== null) {
                        const { error: decErr } = await supabaseClient
                            .from("coupons")
                            .update({ usage_limit: newCoupon.usage_limit - 1 })
                            .eq("id", newCouponId);
                        
                        if (decErr) throw new Error("Lỗi khi cập nhật lượt dùng mã giảm giá mới.");
                    }
                }

                // 2. If an old coupon is removed or replaced, refund/increment its usage_limit
                if (oldCouponId) {
                    const { data: oldCoupon } = await supabaseClient
                        .from("coupons")
                        .select("usage_limit")
                        .eq("id", oldCouponId)
                        .single();

                    if (oldCoupon && oldCoupon.usage_limit !== null) {
                        const { error: incErr } = await supabaseClient
                            .from("coupons")
                            .update({ usage_limit: oldCoupon.usage_limit + 1 })
                            .eq("id", oldCouponId);
                        
                        if (incErr) {
                            console.error("Không thể hoàn lại lượt dùng cho coupon cũ:", incErr);
                        }
                    }
                }
            }

            // 3. Execute Refine's default submit function to save order changes
            if (formProps.onFinish) {
                await formProps.onFinish(values);
                message.success({
                    content: "Cập nhật đơn hàng thành công!",
                    key,
                });
            }
        } catch (error: any) {
            console.error(error);
            message.error({
                content: error.message || "Đã xảy ra lỗi khi lưu đơn hàng.",
                key,
                duration: 4,
            });
        }
    };

    return (
        <Edit saveButtonProps={saveButtonProps} title="Chỉnh sửa Đơn hàng">
            <Form 
                {...formProps} 
                onFinish={handleOnFinish} 
                onValuesChange={handleValuesChange} 
                layout="vertical"
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Khách hàng (Email)"
                            name="user_id"
                            rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
                        >
                            <Select {...userSelectProps} placeholder="Chọn khách hàng" showSearch />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Mã giảm giá (Coupon)"
                            name="coupon_id"
                        >
                            <Select {...couponSelectProps} allowClear placeholder="Chọn mã giảm giá (không bắt buộc)" showSearch />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Tổng tiền gốc"
                            name="total_amount"
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value) => `${value}`.replace(/\$\s?|(,*)/g, "")}
                                addonAfter="₫"
                                placeholder="0"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Tổng tiền thanh toán"
                            name="final_amount"
                            rules={[{ required: true, message: "Vui lòng nhập số tiền thanh toán" }]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value) => `${value}`.replace(/\$\s?|(,*)/g, "")}
                                addonAfter="₫"
                                placeholder="0"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Trạng thái đơn hàng"
                            name="status"
                            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                        >
                            <Select
                                options={[
                                    { label: "Chờ xử lý (Pending)", value: "pending" },
                                    { label: "Đang xử lý (Processing)", value: "processing" },
                                    { label: "Đang giao hàng (Shipped)", value: "shipped" },
                                    { label: "Đã giao hàng (Delivered)", value: "delivered" },
                                    { label: "Hoàn thành (Completed)", value: "completed" },
                                    { label: "Đã hủy (Cancelled)", value: "cancelled" },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Số điện thoại nhận hàng"
                            name="receiver_phone"
                        >
                            <Input placeholder="Nhập số điện thoại người nhận" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Địa chỉ giao hàng"
                            name="shipping_address"
                        >
                            <Input.TextArea rows={2} placeholder="Nhập địa chỉ giao hàng chi tiết" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};
