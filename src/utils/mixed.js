export const objectifyArr = (arr, field) => {
    return arr.reduce((acc, item) => {
        acc[field] = item;
        return acc;
    }, {});
};
