import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WeeklyEventsCard from "./WeeklyEventsCard.vue";
import {
  crearSolicitudEvento,
  obtenerEventos,
  obtenerImagenCategoriaEvento,
  tieneSolicitudEventoPendiente,
} from "@/services/events";

vi.mock("@/services/events", () => ({
  crearSolicitudEvento: vi.fn(),
  obtenerEventos: vi.fn(),
  obtenerImagenCategoriaEvento: vi.fn(),
  tieneSolicitudEventoPendiente: vi.fn(),
}));

describe("WeeklyEventsCard", () => {
  beforeEach(() => {
    tieneSolicitudEventoPendiente.mockResolvedValue(false);
    crearSolicitudEvento.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("oculta categoría y contador, y alinea las flechas con la fecha", async () => {
    vi.useFakeTimers();
    const fechaEvento = new Date();
    fechaEvento.setHours(12, 0, 0, 0);

    obtenerEventos.mockResolvedValue([
      {
        titulo: "Evaluación inicial",
        fechaInicio: fechaEvento.getTime(),
        fechaFin: fechaEvento.getTime(),
        nombreCategoria: "Evaluaciones y calificaciones",
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

    expect(wrapper.find(".weekly-event-category").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("1 / 1");
    expect(wrapper.get(".weekly-event-date-row").findAll(".weekly-events-arrow")).toHaveLength(2);

    wrapper.unmount();
  });

  it("crea una solicitud pendiente desde el formulario compacto", async () => {
    vi.useFakeTimers();
    obtenerEventos.mockResolvedValue([]);

    const wrapper = mount(WeeklyEventsCard, {
      global: {
        stubs: {
          IonIcon: true,
          IonToast: true,
        },
      },
    });
    await flushPromises();

    await wrapper.get(".weekly-event-request-open").trigger("click");
    await wrapper.get("#weekly-event-title-input").setValue("Reunión de coordinación");
    await wrapper.get("#weekly-event-category-input").setValue("Gestión y coordinación académica");
    await wrapper.get("#weekly-event-start-input").setValue("2026-08-10");
    await wrapper.get("#weekly-event-end-input").setValue("2026-08-11");
    await wrapper.get(".weekly-event-request-form").trigger("submit");
    await flushPromises();

    expect(crearSolicitudEvento).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      "Reunión de coordinación",
      new Date(2026, 7, 10).getTime(),
      new Date(2026, 7, 11).getTime(),
      "Gestión y coordinación académica",
    );
    expect(wrapper.text()).toContain("A la espera de validar el último evento por el administrador");
    expect(wrapper.find(".weekly-event-request-form").exists()).toBe(false);

    wrapper.unmount();
  });

  it("no muestra el botón si el usuario ya tiene una solicitud pendiente", async () => {
    vi.useFakeTimers();
    obtenerEventos.mockResolvedValue([]);
    tieneSolicitudEventoPendiente.mockResolvedValue(true);

    const wrapper = mount(WeeklyEventsCard, {
      global: {
        stubs: {
          IonIcon: true,
          IonToast: true,
        },
      },
    });
    await flushPromises();

    expect(wrapper.find(".weekly-event-request-open").exists()).toBe(false);
    expect(wrapper.text()).toContain("A la espera de validar el último evento por el administrador");
    wrapper.unmount();
  });

  it("muestra la imagen de categoría enviada por EventsServer", async () => {
    vi.useFakeTimers();
    const fechaEvento = new Date();
    fechaEvento.setHours(12, 0, 0, 0);
    const imagen = new Blob(["png"], { type: "image/png" });
    const crearUrl = vi.fn(() => "blob:categoria-evento");
    const revocarUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: crearUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revocarUrl,
    });

    obtenerEventos.mockResolvedValue([
      {
        titulo: "Evaluación inicial",
        fechaInicio: fechaEvento.getTime(),
        fechaFin: fechaEvento.getTime(),
        nombreCategoria: "Evaluaciones y calificaciones",
        imagenCategoriaUrl: "/events/eventos/imagen?nombreCategoria=Evaluaciones%20y%20calificaciones",
      },
    ]);
    obtenerImagenCategoriaEvento.mockResolvedValue(imagen);

    const wrapper = mount(WeeklyEventsCard, {
      global: {
        stubs: {
          IonIcon: true,
          IonToast: true,
        },
      },
    });

    await flushPromises();

    expect(obtenerImagenCategoriaEvento).toHaveBeenCalledTimes(1);
    expect(crearUrl).toHaveBeenCalledWith(imagen);
    expect(wrapper.get(".weekly-event-image").attributes("src"))
      .toBe("blob:categoria-evento");

    wrapper.unmount();
    expect(revocarUrl).toHaveBeenCalledWith("blob:categoria-evento");
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  it("vuelve a consultar los eventos al llegar la medianoche", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 5, 23, 59, 59, 900));
    obtenerEventos.mockResolvedValue([]);

    const wrapper = mount(WeeklyEventsCard, {
      global: {
        stubs: {
          IonIcon: true,
          IonToast: true,
        },
      },
    });

    await flushPromises();
    expect(obtenerEventos).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(100);
    await flushPromises();

    expect(obtenerEventos).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });
});
