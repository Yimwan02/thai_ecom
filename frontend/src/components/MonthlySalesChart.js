import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const REFRESH_INTERVAL = 5000;
const BAR_COLORS = [
  "rgba(54, 162, 235, 0.7)",
  "rgba(255, 99, 132, 0.7)",
  "rgba(255, 206, 86, 0.7)",
  "rgba(75, 192, 192, 0.7)",
  "rgba(153, 102, 255, 0.7)",
  "rgba(255, 159, 64, 0.7)",
  "rgba(99, 255, 132, 0.7)",
  "rgba(120, 120, 255, 0.7)",
  "rgba(180, 99, 255, 0.7)",
];
//เก็บข้อมูลกราฟ ข้อมูลตาราง สถานะโหลด และเวลาอัปเดตล่าสุด
function MonthlyProductSalesChart() {
  const [chartData, setChartData] = useState(null);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchData = async () => {
    try {
      const [monthlyRes, summaryRes] = await Promise.all([
        axios.get("http://localhost:5000/api/orders/stats/monthly-products"), //ดึงข้อมูลกราฟรายเดือน
        axios.get("http://localhost:5000/api/products/sales-summary") //ดึงข้อมูลสรุปยอดขายแยกตามสินค้า
      ]);
      //เอาข้อมูลจาก backend มาเก็บใน state เพื่อเอาไปแสดงผล
      const monthlyData = monthlyRes.data || [];
      const salesSummary = summaryRes.data || [];

      const products = [...new Set(monthlyData.map((item) => item.product_name))];
      const monthNumbers = [...new Set(monthlyData.map((item) => Number(item.month)))].sort((a, b) => a - b);

      const datasets = products.map((product, index) => ({
        label: product,
        data: monthNumbers.map((month) => {
          const found = monthlyData.find(
            (item) => item.product_name === product && Number(item.month) === month
          );
          return found ? Number(found.total_quantity) : 0;
        }),
        backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
        borderRadius: 6,
      }));

      setChartData({
        labels: monthNumbers.map((month) => `เดือน ${month}`),
        datasets,
      });

      setSummaryData(salesSummary);
      setLastUpdated(new Date().toLocaleString("th-TH"));
    } catch (err) {
      console.error("โหลดข้อมูลยอดขายไม่สำเร็จ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  //คำนวณออกมาเป็น 1.จำนวนสินค้าในรายงาน 2.จำนวนชิ้นที่ขาย 3.ยอดขายรวม
  const totals = useMemo(() => {
    return summaryData.reduce(
      (acc, item) => {
        acc.totalProducts += 1;
        acc.totalQuantity += Number(item.total_quantity || 0);
        acc.totalRevenue += Number(item.total_revenue || 0);
        return acc;
      },
      { totalProducts: 0, totalQuantity: 0, totalRevenue: 0 }
    );
  }, [summaryData]);

  if (loading) {
    return (
      <div className="card p-4 shadow-sm mt-4">
        <p className="mb-0">กำลังโหลดข้อมูลยอดสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-1">📊 ยอดสั่งซื้อสินค้าแยกตามรายการสินค้า</h4>
          <small className="text-muted">
            ข้อมูลรีเฟรชอัตโนมัติทุก {REFRESH_INTERVAL / 1000} วินาที
            {lastUpdated ? ` • อัปเดตล่าสุด ${lastUpdated}` : ""}
          </small>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchData}>
          รีเฟรชตอนนี้
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">จำนวนสินค้าในรายงาน</div>
              <div className="fs-3 fw-bold">{totals.totalProducts}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">จำนวนชิ้นที่ถูกสั่งซื้อ</div>
              <div className="fs-3 fw-bold text-primary">{totals.totalQuantity}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">ยอดขายรวม</div>
              <div className="fs-3 fw-bold text-success">฿{totals.totalRevenue.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3 shadow-sm border-0 mb-4">
        <h5 className="mb-3">กราฟจำนวนสินค้าที่ถูกสั่งซื้อรายเดือน</h5>
        {chartData && chartData.datasets.length > 0 ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "ยอดสั่งซื้อรายเดือนแยกตามสินค้า" },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1, precision: 0 },
                },
              },
            }}
          />
        ) : (
          <div className="alert alert-light border mb-0">ยังไม่มีข้อมูลคำสั่งซื้อรายเดือน</div>
        )}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="mb-3">ตารางสรุปยอดสั่งซื้อแยกตามสินค้า</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle text-center mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ลำดับ</th>
                  <th>รูป</th>
                  <th className="text-start">ชื่อสินค้า</th>
                  <th>จำนวนที่สั่งซื้อ</th>
                  <th>จำนวนออเดอร์</th>
                  <th>ยอดรวม</th>
                  <th>ออเดอร์ล่าสุด</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-muted py-4">ยังไม่พบข้อมูลยอดสั่งซื้อ</td>
                  </tr>
                ) : (
                  summaryData.map((item, index) => (
                    <tr key={item.product_id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={item.product_img ? `http://localhost:5000/images/${item.product_img}` : "https://placehold.co/80x80?text=No+Image"}
                          alt={item.product_name}
                          width="70"
                          height="70"
                          style={{ objectFit: "contain", backgroundColor: "#fff" }}
                          className="rounded border"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/80x80?text=No+Image";
                          }}
                        />
                      </td>
                      <td className="text-start fw-semibold">{item.product_name}</td>
                      <td>
                        <span className={`badge ${Number(item.total_quantity) > 0 ? "bg-primary" : "bg-secondary"}`}>
                          {Number(item.total_quantity)} ชิ้น
                        </span>
                      </td>
                      <td>{Number(item.total_orders)}</td>
                      <td className="text-success fw-bold">฿{Number(item.total_revenue).toLocaleString()}</td>
                      <td>
                        {item.last_order_date
                          ? new Date(item.last_order_date).toLocaleString("th-TH")
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyProductSalesChart;