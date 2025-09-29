import { LineChart, Line, XAxis, YAxis } from 'recharts';
import React from 'react';



type AlignedPoint = {
    time: number;
    reference: number;
    user: number;
    accuracy: number;
};

const AlignedPitchChart = React.memo(({ data }: { data: AlignedPoint[] }) => {

    const processedData = data.map(d => ({
        time: d.time,
        reference: d.reference,
        userGood: d.accuracy > 0.75 ? d.user : null,
        userMid: d.accuracy <= 0.75 && d.accuracy > 0.5 ? d.user : null,
        userPoor: d.accuracy <= 0.5 ? d.user : null,
      }));

    return (
        <LineChart width={600} height={400} data={processedData}>
            <XAxis
                tick={false}
                dataKey="time"
            />
            <YAxis
                tick={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => value.toFixed(1)}
            />
            <Line
                type="monotone"
                dataKey="reference"
                stroke="#B0B0B0"
                dot={false}
                strokeWidth={5}
            />
            <Line
                type="monotone"
                dataKey="userGood"
                stroke="#008000"
                dot={false}
                strokeWidth={5}
                connectNulls={false}
            />
            <Line
                type="monotone"
                dataKey="userMid"
                stroke="#FFD700"
                dot={false}
                strokeWidth={5}
                connectNulls={false}
            />
            <Line
                type="monotone"
                dataKey="userPoor"
                stroke="#FF0000"
                dot={false}
                strokeWidth={5}
                connectNulls={false}
            />

        </LineChart>
    );
});

export default AlignedPitchChart;