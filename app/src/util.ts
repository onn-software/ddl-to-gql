export const associateBy = <K extends string | number, T>(
    array: T[],
    getKey: (entry: T) => K
): Record<K, T> =>
    array.reduce((res, cur) => {
        res[getKey(cur)] = cur;
        return res;
    }, {} as Record<K, T>);

export const distinct: <T extends string | number>(arr: T[]) => T[] = (value) => {
    const collector: Record<string | number, any> = {};
    value.forEach((v) => (collector[v] = v));
    return Object.values(collector);
};

export const distinctBy: <T>(arr: T[], by: (item:T) => (string | number)) => T[] = (value, by) => {
    const collector: Record<string | number, any> = {};
    value.forEach((v) => (collector[by(v)] = v));
    return Object.values(collector);
};
