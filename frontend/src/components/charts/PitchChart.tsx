import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

type PitchPoint = {
  time: number;
  frequency: number;
};

import React from "react";

const PitchChart = React.memo(
  ({ data, color }: { data: PitchPoint[]; color: string }) => {
    return (
      <div className="w-full min-w-0 h-[clamp(170px,34vh,360px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
        </ResponsiveContainer>
      </div>
    );
  }
);

PitchChart.displayName = "PitchChart";

export default PitchChart;
