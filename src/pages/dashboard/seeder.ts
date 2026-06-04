import type { SupabaseClient } from "@supabase/supabase-js";

export async function seedDemoData(supabaseClient: SupabaseClient): Promise<void> {
  // 1. Fetch products
  const { data: products, error: productsErr } = await supabaseClient
    .from("products")
    .select("id, name, price")
    .eq("is_active", true);

  if (productsErr || !products || products.length === 0) {
    throw new Error("Không tìm thấy sản phẩm nào đang hoạt động trong hệ thống. Hãy thêm sản phẩm trước.");
  }

  // 2. Fetch users (customers)
  const { data: users, error: usersErr } = await supabaseClient
    .from("users")
    .select("id, full_name, phone, address")
    .eq("role", "customer");

  if (usersErr || !users || users.length === 0) {
    throw new Error("Không tìm thấy người dùng nào có vai trò 'customer'. Hãy đăng ký một vài tài khoản khách hàng trước.");
  }

  // 3. Clear existing orders, items, payments to prevent duplicate/messy data
  // Using delete with neq("id", 0) since id is serial integer and always > 0
  const { error: delItemsErr } = await supabaseClient.from("order_items").delete().neq("id", 0);
  if (delItemsErr) console.error("Lỗi xóa order_items cũ:", delItemsErr);

  const { error: delPayErr } = await supabaseClient.from("payments").delete().neq("id", 0);
  if (delPayErr) console.error("Lỗi xóa payments cũ:", delPayErr);

  const { error: delOrdersErr } = await supabaseClient.from("orders").delete().neq("id", 0);
  if (delOrdersErr) console.error("Lỗi xóa orders cũ:", delOrdersErr);

  const orderStatuses = ["completed", "completed", "completed", "completed", "pending", "pending", "cancelled"];
  const paymentMethods = ["cod", "vnpay", "momo"];
  const shippingAddresses = [
    "120 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    "45 Hùng Vương, Phường Lộc Thọ, Nha Trang, Khánh Hòa",
    "789 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh",
    "12 Trần Hưng Đạo, Phường Lộc Thọ, Nha Trang, Khánh Hòa",
    "234 Trần Phú, Phường 2, Vũng Tàu, Bà Rịa - Vũng Tàu"
  ];
  
  const now = new Date();

  // 4. Generate 20 random orders spread over the last 30 days
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Spread orders over last 30 days
    const orderDate = new Date();
    orderDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
    orderDate.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60), 0, 0);

    // Pick 1-3 random products
    const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
    const itemsCount = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = shuffledProducts.slice(0, itemsCount);

    let totalAmount = 0;
    const orderItems = [];

    for (const prod of selectedProducts) {
      const quantity = Math.floor(Math.random() * 4) + 1; // 1 to 4
      const price = Number(prod.price);
      totalAmount += price * quantity;
      
      orderItems.push({
        product_id: prod.id,
        quantity,
        price_at_purchase: price,
        created_at: orderDate.toISOString()
      });
    }

    // Apply potential coupon code random discount (15% chance)
    let finalAmount = totalAmount;
    if (Math.random() < 0.15) {
      const discount = Math.floor(totalAmount * 0.1); // 10% discount
      finalAmount = totalAmount - discount;
    }

    const shippingAddress = user.address || shippingAddresses[Math.floor(Math.random() * shippingAddresses.length)];
    const receiverPhone = user.phone || "09" + Math.floor(10000000 + Math.random() * 90000000);

    // Insert Order
    const { data: orderData, error: orderErr } = await supabaseClient
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        final_amount: finalAmount,
        status,
        shipping_address: shippingAddress,
        receiver_phone: receiverPhone,
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString()
      })
      .select("id")
      .single();

    if (orderErr || !orderData) {
      console.error("Lỗi chèn đơn hàng:", orderErr);
      continue;
    }

    const orderId = orderData.id;

    // Insert Order Items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderId
    }));

    const { error: itemsInsertErr } = await supabaseClient
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsInsertErr) {
      console.error(`Lỗi chèn order_items cho đơn #${orderId}:`, itemsInsertErr);
    }

    // Insert Payment Record
    const paymentStatus = status === "completed" ? "paid" : status === "cancelled" ? "failed" : "unpaid";
    const paidAt = paymentStatus === "paid" ? orderDate.toISOString() : null;

    const { error: paymentInsertErr } = await supabaseClient
      .from("payments")
      .insert({
        order_id: orderId,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        transaction_id: paymentStatus === "paid" ? `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}` : null,
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString(),
        paid_at: paidAt
      });

    if (paymentInsertErr) {
      console.error(`Lỗi chèn payment cho đơn #${orderId}:`, paymentInsertErr);
    }
  }
}
