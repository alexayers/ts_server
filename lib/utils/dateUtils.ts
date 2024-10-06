export function getYearMonthDay(): string {

    let date : Date = new Date();
    const year: number  = date.getFullYear();
    const month : string = (date.getMonth() + 1).toString().padStart(2, '0');
    const day : string = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
