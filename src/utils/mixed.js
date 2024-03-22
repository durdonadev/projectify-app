export const objectifyArr = (arr, field) => {
    return arr.reduce((acc, item) => {
        acc[item[field]] = item;
        return acc;
    }, {});
};
