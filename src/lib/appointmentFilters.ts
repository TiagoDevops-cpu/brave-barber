import type { Appointment } from "../types";

export type AppointmentFilters = {
  date?: string;
  startDate?: string;
  endDate?: string;
  futureOnly?: string;
  status?: string;
  customerPhone?: string;
};

export const filterAppointments = (
  appointments: Appointment[],
  filters: AppointmentFilters = {},
): Appointment[] => {
  let result = [...appointments];

  if (filters.date) {
    result = result.filter((appointment) => appointment.date === filters.date);
  } else {
    if (filters.startDate)
      result = result.filter(
        (appointment) => appointment.date >= filters.startDate!,
      );
    if (filters.endDate)
      result = result.filter(
        (appointment) => appointment.date <= filters.endDate!,
      );
    if (filters.futureOnly === "true") {
      const today = new Date().toISOString().split("T")[0];
      result = result.filter((appointment) => appointment.date >= today);
    }
  }

  if (filters.status && filters.status !== "todos") {
    result = result.filter(
      (appointment) => appointment.status === filters.status,
    );
  }

  if (filters.customerPhone) {
    const cleanFilter = filters.customerPhone.replace(/\D/g, "");
    result = result.filter((appointment) =>
      appointment.customerPhone.replace(/\D/g, "").includes(cleanFilter),
    );
  }

  return result.sort((first, second) =>
    `${second.date} ${second.time}`.localeCompare(
      `${first.date} ${first.time}`,
    ),
  );
};
