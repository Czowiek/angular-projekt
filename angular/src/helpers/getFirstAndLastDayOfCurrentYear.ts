import {getCurrentDate} from "./getCurrentDate";

export function getFirstAndLastDayOfCurrentYear() {
  const currentYear = new Date().getFullYear();

  // Pierwszy dzień roku
  const firstDay = new Date(currentYear, 0, 1);

  // Ostatni dzień roku
  const lastDay = new Date(currentYear, 11, 31);

  function formatDate(date:Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Miesiące są indeksowane od 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return {
    firstDay: formatDate(firstDay),
    lastDay: getCurrentDate(),
  };
}
