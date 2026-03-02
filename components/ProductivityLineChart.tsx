// components/ProductivityLineChart.tsx

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  name: string;
  productivity: number;
};

interface ProductivityLineChartProps {
  data: ChartData[];
}

const ProductivityLineChart = ({ data }: ProductivityLineChartProps) => {
  const maxHours = Math.ceil(Math.max(...data.map((d) => d.productivity)));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          domain={[0, maxHours]}
          tickFormatter={(value) => `${value}h`}
          label={{ value: "Hours", angle: -90, position: "insideLeft" }}
        />
        <Tooltip formatter={(value) => `${value} hours`} />
        <Line
          type="monotone"
          dataKey="productivity"
          stroke="#4CAF50"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProductivityLineChart;
