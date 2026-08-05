import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import WeeklyEventsCard from "./WeeklyEventsCard.vue";
import { obtenerEventos } from "@/services/events";

vi.mock("@/services/events", () => ({
  obtenerEventos: vi.fn(),
}));

describe("WeeklyEventsCard", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("muestra la descripción de la categoría en un tooltip accesible", async () => {
    vi.useFakeTimers();
    const fechaEvento = new Date();
    fechaEvento.setHours(12, 0, 0, 0);

    obtenerEventos.mockResolvedValue([
      {
        titulo: "Evaluación inicial",
        fechaInicio: fechaEvento.getTime(),
        fechaFin: fechaEvento.getTime(),
        nombreCategoria: "Evaluaciones y calificaciones",
        descripcionCategoria: "Evaluaciones iniciales y sesiones trimestrales.",
      },
    ]);

    const wrapper = mount(WeeklyEventsCard, {
      global: {
        stubs: {
          IonIcon: true,
          IonToast: true,
        },
      },
    });

    await flushPromises();

    const categoria = wrapper.get(".weekly-event-category");
    const tooltip = wrapper.get('[role="tooltip"]');

    expect(categoria.text()).toBe("Evaluaciones y calificaciones");
    expect(categoria.attributes("tabindex")).toBe("0");
    expect(categoria.attributes("aria-describedby"))
      .toBe("weekly-event-category-description");
    expect(tooltip.text()).toBe("Evaluaciones iniciales y sesiones trimestrales.");

    wrapper.unmount();
  });
});
