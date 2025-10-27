import { LineChart, Line, XAxis, YAxis } from "recharts";

type PitchPoint = {
  time: number;
  frequency: number;
};

import React from "react";

const PitchChart = React.memo(
  ({ data, color }: { data: PitchPoint[]; color: string }) => {
    return (
      <LineChart width={1200} height={400} data={data}>
        <XAxis tick={false} dataKey="time" />
        <YAxis
          tick={false}
          domain={["dataMin - 0.5", "dataMax + 0.5"]}
          tickFormatter={(value) => value.toFixed(1)}
        />
        <Line
          type="monotone"
          dataKey="frequency"
          stroke={color}
          dot={false}
          strokeWidth={5}
        />
      </LineChart>
    );
  }
);

export default PitchChart;
