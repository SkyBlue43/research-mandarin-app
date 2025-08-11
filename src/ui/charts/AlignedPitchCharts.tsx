import { LineChart, Line, XAxis, YAxis } from 'recharts';
import React from 'react';

type AlignedPoint = {
    time: number;
    refernce: number;
    user: number;
};

const AlignedPitchChart = React.memo(({ data }: { data: AlignedPoint[] }) => {
    return (
        <LineChart width={600} height={400} data={data}>
            <XAxis tick={false} dataKey="time" />
            <YAxis
                tick={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => value.toFixed(1)}
            />
            <Line
                type="monotone"
                dataKey="reference"
                stroke="#FF69B4"
                dot={false}
                strokeWidth={5}
                name="Reference"
            />
            <Line
                type="monotone"
                dataKey="user"
                stroke="#82ca9d"
                dot={false}
                strokeWidth={5}
                name="User"
            />
        </LineChart>
    );
});

export default AlignedPitchChart;