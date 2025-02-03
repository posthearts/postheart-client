import { type LetterType } from "@/components/LetterView/letter";

export const STORAGE_KEY = "letters";

// Utility functions
export function getLettersFromStorage(): LetterType[] {
    const letters = localStorage.getItem(STORAGE_KEY);
    return letters ? JSON.parse(letters) : [];
}

export function saveLettersToStorage(letters: LetterType[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
}

export type GroupByDateType = {
    today: LetterType[],
    yesterday: LetterType[],
    'Last 7 Days': LetterType[],
    'Last 30 Days': LetterType[],
    byYear: Record<number, LetterType[]>,
};

export function groupLettersByDate(letters: LetterType[]) {
    const now = new Date();

    const groupByDate: GroupByDateType = {
        today: [],
        yesterday: [],
        'Last 7 Days': [],
        'Last 30 Days': [],
        byYear: {},
    };

    letters.forEach((letter) => {
        const updatedAt = new Date(letter.updatedAt || '');
        const diffTime = now.getTime() - updatedAt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

        if (diffDays === 0) {
            groupByDate.today.push(letter);
        } else if (diffDays === 1) {
            groupByDate.yesterday.push(letter);
        } else if (diffDays >= 2 && diffDays <= 7) {
            groupByDate['Last 7 Days'].push(letter);
        } else if (diffDays > 7 && diffDays <= 30) {
            groupByDate['Last 30 Days'].push(letter);
        } else {
            const year = updatedAt.getFullYear();
            if (!groupByDate.byYear[year]) {
                groupByDate.byYear[year] = [];
            }
            groupByDate.byYear[year].push(letter);
        }
    });

    // Sorting function (ascending order by updatedAt)
    const sortByDate = (a: LetterType, b: LetterType) => new Date(b.updatedAt ?? '').getTime() - new Date(a.updatedAt ?? '').getTime();

    // Sort each category
    groupByDate.today.sort(sortByDate);
    groupByDate.yesterday.sort(sortByDate);
    groupByDate['Last 7 Days'].sort(sortByDate);
    groupByDate['Last 30 Days'].sort(sortByDate);

    for (const year in groupByDate.byYear) {
        groupByDate.byYear[year].sort(sortByDate);
    }

    return groupByDate;
}
