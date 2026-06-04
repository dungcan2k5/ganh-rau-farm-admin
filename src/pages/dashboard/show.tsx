import React, { useEffect, useState, useCallback } from "react";
import { List } from "@refinedev/antd";
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Alert, 
  Spin, 
  message, 
  Progress, 
  Tooltip, 
  Empty 
} from "antd";
import { 
  DollarCircleOutlined, 
  ShoppingCartOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  WarningOutlined, 
  ReloadOutlined,
  DatabaseOutlined,
  RiseOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { Line, Pie } from "@ant-design/plots";
import { supabaseClient } from "../../providers/supabase-client";
import { seedDemoData } from "./seeder";
import dayjs from "dayjs";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: number;
  final_amount: number;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  unit: string;
  price: number;
}

export const DashboardReport = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalCustomers: 0,
  });
  const [revenueTrend, setRevenueTrend] = useState<{ date: string; revenue: number }[]>([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState<{ type: string; value: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  // Function to load all data from Supabase
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch all orders for revenue and trend calculation
      const { data: orders, error: ordersErr } = await supabaseClient
        .from("orders")
        .select("id, final_amount, status, created_at");

      if (ordersErr) throw ordersErr;

      const orderList = orders || [];
      const totalOrdersCount = orderList.length;

      // Calculate revenue (only completed orders)
      const completedRevenue = orderList
        .filter((o) => o.status === "completed" || o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.final_amount || 0), 0);

      // 2. Fetch active products count
      const { count: activeProductsCount, error: activeProductsErr } = await supabaseClient
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);

      if (activeProductsErr) throw activeProductsErr;

      // 3. Fetch total customers count
      const { count: customersCount, error: customersErr } = await supabaseClient
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer");

      if (customersErr) throw customersErr;

      // 4. Fetch 5 recent orders with user details (join)
      const { data: recentOrdersData, error: recentOrdersErr } = await supabaseClient
        .from("orders")
        .select(`
          id,
          final_amount,
          status,
          created_at,
          users (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentOrdersErr) throw recentOrdersErr;

      const formattedRecentOrders: RecentOrder[] = (recentOrdersData || []).map((order: any) => {
        const user = order.users;
        return {
          id: order.id,
          final_amount: Number(order.final_amount || 0),
          status: order.status || "pending",
          created_at: order.created_at,
          user_name: user?.full_name || "Khách vãng lai",
          user_email: user?.email || "",
        };
      });

      // 5. Fetch low stock products (stock < 10)
      const { data: lowStockData, error: lowStockErr } = await supabaseClient
        .from("products")
        .select("id, name, stock, unit, price")
        .lt("stock", 10)
        .eq("is_active", true)
        .order("stock", { ascending: true })
        .limit(5);

      if (lowStockErr) throw lowStockErr;

      // Set global stats state
      setStats({
        totalRevenue: completedRevenue,
        totalOrders: totalOrdersCount,
        activeProducts: activeProductsCount || 0,
        totalCustomers: customersCount || 0,
      });

      setRecentOrders(formattedRecentOrders);
      setLowStockProducts(lowStockData || []);

      // 6. Generate 30 days revenue trend data
      const trendData: { date: string; revenue: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = dayjs().subtract(i, "day").format("DD/MM");
        trendData.push({ date: d, revenue: 0 });
      }

      orderList
        .filter((o) => o.status === "completed" || o.status === "delivered")
        .forEach((o) => {
          const orderDay = dayjs(o.created_at).format("DD/MM");
          const dayMatch = trendData.find((t) => t.date === orderDay);
          if (dayMatch) {
            dayMatch.revenue += Number(o.final_amount || 0);
          }
        });

      setRevenueTrend(trendData);

      // 7. Calculate order status distribution
      const statusCounts: Record<string, number> = {
        completed: 0,
        pending: 0,
        cancelled: 0,
      };

      orderList.forEach((o) => {
        const s = o.status || "pending";
        if (statusCounts[s] !== undefined) {
          statusCounts[s]++;
        } else {
          statusCounts[s] = 1;
        }
      });

      const distData = Object.keys(statusCounts)
        .filter((key) => statusCounts[key] > 0 || totalOrdersCount === 0)
        .map((key) => {
          let label = "Chờ xử lý";
          if (key === "completed" || key === "delivered") label = "Hoàn thành";
          if (key === "cancelled") label = "Đã hủy";
          return {
            type: label,
            value: statusCounts[key] || 0,
          };
        });

      setOrderStatusDistribution(distData);

    } catch (error: any) {
      console.error("Lỗi tải dữ liệu dashboard:", error);
      message.error("Không thể tải dữ liệu thống kê: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Seeder handler
  const handleSeedData = async () => {
    setSeeding(true);
    const hide = message.loading("Đang khởi tạo dữ liệu mẫu...", 0);
    try {
      await seedDemoData(supabaseClient);
      message.success("Khởi tạo dữ liệu mẫu thành công!");
      await loadDashboardData();
    } catch (error: any) {
      console.error(error);
      message.error("Lỗi khởi tạo dữ liệu: " + error.message);
    } finally {
      hide();
      setSeeding(false);
    }
  };

  // Ant Design Plot Configurations
  const lineConfig = {
    data: revenueTrend,
    xField: "date",
    yField: "revenue",
    style: {
      lineWidth: 3,
      stroke: "#52c41a", // Nông nghiệp sạch - Green
    },
    tooltip: {
      channel: "y",
      valueFormatter: (v: number) => `${v.toLocaleString()} ₫`,
    },
    shapeField: "smooth",
    interaction: {
      tooltip: { marker: false },
    },
    axis: {
      y: {
        labelFormatter: (v: number) => `${(v / 1000).toFixed(0)}k`,
      }
    }
  };

  const pieConfig = {
    data: orderStatusDistribution,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      text: "value",
      style: {
        fontWeight: "bold",
        fontSize: 14,
        fill: "#fff",
      },
    },
    colorFieldColor: {
      "Hoàn thành": "#52c41a",
      "Chờ xử lý": "#faad14",
      "Đã hủy": "#f5222d",
    },
    legend: {
      color: {
        position: "bottom",
        layout: "horizontal",
      },
    },
    style: {
      stroke: "#fff",
      inset: 2,
    },
  };

  // Recent orders table columns
  const orderColumns = [
    {
      title: "Mã Đơn",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <span style={{ fontWeight: "bold" }}>#{id}</span>,
    },
    {
      title: "Khách Hàng",
      key: "customer",
      render: (_: any, record: RecentOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.user_name}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>{record.user_email}</div>
        </div>
      ),
    },
    {
      title: "Tổng Tiền",
      dataIndex: "final_amount",
      key: "final_amount",
      render: (amount: number) => (
        <span style={{ color: "#3f8600", fontWeight: "bold" }}>
          {amount.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "orange";
        let text = "Chờ xử lý";
        if (status === "completed" || status === "delivered") {
          color = "green";
          text = "Hoàn thành";
        } else if (status === "cancelled") {
          color = "red";
          text = "Đã hủy";
        }
        return <Tag color={color} style={{ borderRadius: "10px", padding: "2px 8px" }}>{text}</Tag>;
      },
    },
    {
      title: "Thời Gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("HH:mm - DD/MM/YYYY"),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" tip="Đang tải dữ liệu báo cáo..." />
      </div>
    );
  }

  return (
    <List title="Báo cáo Kết quả Kinh doanh & Quản trị Nông trại">
      <div style={{ padding: "10px 0" }}>
        
        {/* Seeder alert when there are 0 orders */}
        {stats.totalOrders === 0 && (
          <Alert
            message={<span style={{ fontWeight: "bold" }}>Hệ thống chưa có dữ liệu giao dịch</span>}
            description={
              <div>
                <p style={{ margin: "4px 0 12px 0" }}>
                  Cơ sở dữ liệu đơn hàng hiện đang trống. Để hiển thị đầy đủ các biểu đồ xu hướng doanh thu và phân tích hiệu quả bán hàng trực quan, hãy click vào nút bên dưới để tự động tạo dữ liệu đơn hàng mẫu (seeder).
                </p>
                <Button 
                  type="primary" 
                  icon={<DatabaseOutlined />} 
                  onClick={handleSeedData}
                  loading={seeding}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                  Khởi tạo Dữ liệu Mẫu (Demo)
                </Button>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: "24px", borderRadius: "8px", border: "1px dashed #91d5ff" }}
          />
        )}

        {/* Action controls row */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <Space>
            {stats.totalOrders > 0 && (
              <Tooltip title="Tạo lại bộ dữ liệu mẫu mới">
                <Button 
                  type="dashed" 
                  icon={<ReloadOutlined />} 
                  onClick={handleSeedData}
                  loading={seeding}
                >
                  Reset & Re-Seed Demo
                </Button>
              </Tooltip>
            )}
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={loadDashboardData}
              style={{ background: "#3f8600", borderColor: "#3f8600" }}
            >
              Làm mới dữ liệu
            </Button>
          </Space>
        </div>

        {/* KPI Cards Grid */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              bordered={false} 
              className="kpi-card"
              style={{ 
                borderLeft: "5px solid #52c41a", 
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer"
              }}
            >
              <Statistic
                title={
                  <Space style={{ color: "#8c8c8c" }}>
                    <DollarCircleOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
                    <span style={{ fontWeight: 600 }}>Doanh thu (Đã thu)</span>
                  </Space>
                }
                value={stats.totalRevenue}
                precision={0}
                suffix="đ"
                valueStyle={{ color: "#3f8600", fontWeight: "bold", fontSize: "24px" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              bordered={false} 
              className="kpi-card"
              style={{ 
                borderLeft: "5px solid #1890ff", 
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer"
              }}
            >
              <Statistic
                title={
                  <Space style={{ color: "#8c8c8c" }}>
                    <ShoppingCartOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
                    <span style={{ fontWeight: 600 }}>Tổng số đơn hàng</span>
                  </Space>
                }
                value={stats.totalOrders}
                suffix="đơn"
                valueStyle={{ color: "#096dd9", fontWeight: "bold", fontSize: "24px" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              bordered={false} 
              className="kpi-card"
              style={{ 
                borderLeft: "5px solid #faad14", 
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer"
              }}
            >
              <Statistic
                title={
                  <Space style={{ color: "#8c8c8c" }}>
                    <ShoppingOutlined style={{ color: "#faad14", fontSize: "16px" }} />
                    <span style={{ fontWeight: 600 }}>Sản phẩm hoạt động</span>
                  </Space>
                }
                value={stats.activeProducts}
                suffix="mặt hàng"
                valueStyle={{ color: "#d48806", fontWeight: "bold", fontSize: "24px" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              bordered={false} 
              className="kpi-card"
              style={{ 
                borderLeft: "5px solid #722ed1", 
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer"
              }}
            >
              <Statistic
                title={
                  <Space style={{ color: "#8c8c8c" }}>
                    <UserOutlined style={{ color: "#722ed1", fontSize: "16px" }} />
                    <span style={{ fontWeight: 600 }}>Tổng số khách hàng</span>
                  </Space>
                }
                value={stats.totalCustomers}
                suffix="thành viên"
                valueStyle={{ color: "#531dab", fontWeight: "bold", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {/* Revenue Trend Line Chart */}
          <Col xs={24} lg={16}>
            <Card 
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    <RiseOutlined style={{ color: "#52c41a", marginRight: "8px" }} />
                    Biểu đồ Doanh thu (30 ngày gần nhất)
                  </span>
                  {stats.totalRevenue > 0 && (
                    <span style={{ fontSize: "13px", fontWeight: "normal", color: "#8c8c8c" }}>
                      Bán chạy nhất tháng này
                    </span>
                  )}
                </div>
              }
              bordered={false}
              style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              {stats.totalRevenue > 0 ? (
                <div style={{ height: "300px" }}>
                  <Line {...lineConfig} />
                </div>
              ) : (
                <div style={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Empty description="Chưa có dữ liệu doanh thu để vẽ biểu đồ" />
                </div>
              )}
            </Card>
          </Col>

          {/* Order Status Pie/Donut Chart */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <span>
                  <CheckCircleOutlined style={{ color: "#1890ff", marginRight: "8px" }} />
                  Cơ cấu Trạng thái Đơn hàng
                </span>
              }
              bordered={false}
              style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              {stats.totalOrders > 0 ? (
                <div style={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Pie {...pieConfig} />
                </div>
              ) : (
                <div style={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Empty description="Chưa có đơn hàng để phân tích cơ cấu" />
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Detailed Data Row */}
        <Row gutter={[16, 16]}>
          {/* Recent Orders Table */}
          <Col xs={24} lg={15}>
            <Card 
              title="Đơn hàng mới nhất" 
              bordered={false}
              style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Table 
                columns={orderColumns} 
                dataSource={recentOrders} 
                rowKey="id" 
                pagination={false}
                locale={{ emptyText: <Empty description="Chưa có đơn hàng nào" /> }}
              />
            </Card>
          </Col>

          {/* Low Stock Alerts */}
          <Col xs={24} lg={9}>
            <Card 
              title={
                <span style={{ color: lowStockProducts.length > 0 ? "#cf1322" : "inherit" }}>
                  <WarningOutlined style={{ marginRight: "8px" }} />
                  Cảnh báo Hết hàng / Tồn kho thấp
                </span>
              }
              bordered={false}
              style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              {lowStockProducts.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {lowStockProducts.map((prod) => {
                    const pct = Math.min(100, Math.max(0, (prod.stock / 10) * 100));
                    // Color based on stock levels
                    let statusColor = "exception";
                    if (prod.stock > 5) statusColor = "normal"; // orange
                    
                    return (
                      <div key={prod.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 500 }}>{prod.name}</span>
                          <span style={{ color: "#cf1322", fontWeight: "bold" }}>
                            {prod.stock} / 10 {prod.unit}
                          </span>
                        </div>
                        <Progress 
                          percent={pct} 
                          size="small" 
                          status={statusColor === "exception" ? "exception" : "active"}
                          strokeColor={prod.stock <= 5 ? "#ff4d4f" : "#faad14"}
                          showInfo={false} 
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: "20px 0", textAlign: "center" }}>
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="Tuyệt vời! Tất cả sản phẩm đều đủ lượng tồn kho" 
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>

      </div>
    </List>
  );
};