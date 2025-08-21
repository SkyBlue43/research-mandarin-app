import { useEffect, useState } from 'react';

import { fetchCharacters } from '../api/api';

export function useCharacters(test: string | null, arrayIndex: number) {
    const [characters, setCharacters] = useState<any[]>([]);
    const [currentPhrase, setCurrentPhrase] = useState('');
    const [currentPinyin, setCurrentPinyin] = useState('');
    const [currentIndex, setCurrentIndex] = useState("1");

    useEffect(() => {
        
        const loadCharacters = async () => {
            const data = await fetchCharacters(test);
            setCharacters(data.characters);
            setCurrentPhrase(data.characters[arrayIndex].chinese);
            setCurrentPinyin(data.characters[arrayIndex].pinyin);
            setCurrentIndex(data.characters[arrayIndex].index);
        };

        loadCharacters();
    }, [test]);

    const changeWord = (num: string, phrase: string, pinyin: string) => {
        setCurrentIndex(num);
        setCurrentPhrase(phrase);
        setCurrentPinyin(pinyin);
    }

    return {characters, currentIndex, currentPhrase, currentPinyin, changeWord}
}