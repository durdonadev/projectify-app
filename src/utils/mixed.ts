export const objectifyArr = (arr: { [key: string]: any }[], field: string) => {
    return arr.reduce((acc, item) => {
        acc[item[field]] = item;
        return acc;
    }, {});
};
