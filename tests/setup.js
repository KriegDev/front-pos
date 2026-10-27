import { cleanup } from "@testing-library/react";

const memoria = new Map();

const almacenamiento = {
  get length() {
    return memoria.size;
  },
  key(indice) {
    return Array.from(memoria.keys())[indice] ?? null;
  },
  getItem(clave) {
    return memoria.has(clave) ? memoria.get(clave) : null;
  },
  setItem(clave, valor) {
    memoria.set(String(clave), String(valor));
  },
  removeItem(clave) {
    memoria.delete(String(clave));
  },
  clear() {
    memoria.clear();
  },
};

Object.defineProperty(window, "localStorage", {
  value: almacenamiento,
  configurable: true,
});

if (typeof window.fetch !== "function") {
  window.fetch = function () {
    return Promise.reject(new Error("fetch no configurado en la prueba"));
  };
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

beforeEach(() => {
  memoria.clear();
});

afterEach(() => {
  cleanup();
  memoria.clear();
});
