class DateUtil {
    addMinutes(minutes, date) {
        const startDate = date || new Date();
        const unixDate = startDate.setMinutes(startDate.getMinutes() + minutes);

        return new Date(unixDate);
    }
}

export const date = new DateUtil();
