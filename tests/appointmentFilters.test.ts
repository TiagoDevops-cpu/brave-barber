import { describe, expect, it } from "vitest";
import { filterAppointments } from "../src/lib/appointmentFilters";
import type { Appointment } from "../src/types";

const appointment = (overrides: Partial<Appointment>): Appointment => ({
  id: "appointment-1",
  customerId: "customer-1",
  customerName: "Cliente",
  customerPhone: "67999999999",
  date: "2026-08-20",
  time: "10:00",
  serviceIds: ["cut"],
  serviceNames: ["Corte"],
  totalPrice: 40,
  priceDisplay: "R$ 40,00",
  totalDurationMinutes: 40,
  status: "pending",
  createdAt: "2026-08-01T10:00:00.000Z",
  ...overrides,
});

describe("filterAppointments", () => {
  it("filters by normalized customer phone and status", () => {
    const result = filterAppointments(
      [
        appointment({ id: "1", customerPhone: "(67) 99999-9999" }),
        appointment({
          id: "2",
          customerPhone: "(67) 98888-8888",
          status: "cancelled",
        }),
      ],
      { customerPhone: "99999-9999", status: "pending" },
    );

    expect(result.map((item) => item.id)).toEqual(["1"]);
  });

  it("filters by date range and returns latest slot first", () => {
    const result = filterAppointments(
      [
        appointment({ id: "1", date: "2026-08-20", time: "09:00" }),
        appointment({ id: "2", date: "2026-08-21", time: "08:00" }),
        appointment({ id: "3", date: "2026-08-22", time: "12:00" }),
      ],
      { startDate: "2026-08-20", endDate: "2026-08-21" },
    );

    expect(result.map((item) => item.id)).toEqual(["2", "1"]);
  });
});
