import { useEffect } from 'react';
import { saveAccuracyData } from '../api/api';

export function useAccuracy(accuracy: number, name: string, test: string, group: string, phrase: string, array_index: string){

    useEffect(() => {
        saveAccuracyData(accuracy, name, test, group, phrase, array_index);
    }, [accuracy])
}