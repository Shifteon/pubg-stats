import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface StatLineChartProps {
  data: [];
}

export default function StatLineChart(props: StatLineChartProps) {

  return (
    <LineChart
      style={{ width: '100%', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={props.data}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis interval={20} />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Line type="monotone" dot={false} dataKey="isaac_kills" stroke="#023E8A" strokeWidth={2} />
      <Line type="monotone" dot={false} dataKey="cody_kills" stroke="#E27249" strokeWidth={2} />
      <Line type="monotone" dot={false} dataKey="ben_kills" stroke="#D71515" strokeWidth={2} />
      <Line type="monotone" dot={false} dataKey="trenton_kills" stroke="#276221" strokeWidth={2} />
      <Line type="monotone" dot={false} dataKey="team_kills" stroke="#6C3BAA" strokeWidth={2} />
    </LineChart>
  )
}