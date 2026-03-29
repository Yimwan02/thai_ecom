import { useEffect, useState } from "react";
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

const MonthlyProductSalesChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders/stats/monthly-products");
        console.log("API Data:", res.data);

        // สร้าง labels และ dataset
        const products = [...new Set(res.data.map(d => d.product_name))];
        const monthNumbers = [...new Set(res.data.map(d => d.month))];

        const datasets = products.map(product => {
          return {
            label: product,
            data: monthNumbers.map(month => {
              const found = res.data.find(d => d.product_name === product && d.month === month);
              return found ? found.total_quantity : 0;
            }),
            backgroundColor: `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`,
          };
        });

        setChartData({
          labels: monthNumbers.map(m => `เดือน ${m}`),
          datasets
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!chartData) return <p>Loading...</p>;

  return (
    <div className="card p-3 shadow-sm mt-4">
      <h4 className="mb-3">📊 ยอดสินค้ารายเดือน</h4>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Monthly Product Sales" },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
          },
        }}
      />
    </div>
  );
};

export default MonthlyProductSalesChart;