import { useEffect, useState } from 'react';
import { getAccuracy } from '../api/api';

export function useAccuracy(alignedGraphData: any) {
    const [accuracy, setAccuracy] = useState(0.0);
    
    useEffect(() => {
        const calculateAccuracy = async () => {
            const data = await getAccuracy(alignedGraphData);
            setAccuracy(data);

        }
        if (alignedGraphData) {
            calculateAccuracy()
        }
    }, [alignedGraphData])
    
    return { accuracy }
}