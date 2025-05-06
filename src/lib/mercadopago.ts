// MercadoPago integration

export const MERCADO_PAGO_PUBLIC_KEY =
  "APP_USR-f4d2f4d0-8a81-41e9-a40e-f7165d7870d3";
export const MERCADO_PAGO_ACCESS_TOKEN =
  "APP_USR-2690703743722066-022814-a51e772ee3772e65857692f06600fa5d-196058457";

export interface CheckoutItem {
  id: string;
  title: string;
  description?: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  unit_price: number;
}

export interface CheckoutPreference {
  items: CheckoutItem[];
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    address?: {
      street_name?: string;
      street_number?: number;
      zip_code?: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: string;
  payment_methods?: {
    excluded_payment_methods?: { id: string }[];
    excluded_payment_types?: { id: string }[];
    installments?: number;
  };
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
}

export async function createPreference(
  preference: CheckoutPreference,
): Promise<string> {
  try {
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      },
    );

    if (!response.ok) {
      throw new Error(`Error creating preference: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error creating MercadoPago preference:", error);
    throw error;
  }
}

export function loadMercadoPagoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.type = "text/javascript";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load MercadoPago script"));
    document.body.appendChild(script);
  });
}

export function initMercadoPago(): any {
  if (!window.MercadoPago) {
    throw new Error("MercadoPago script not loaded");
  }
  return new window.MercadoPago(MERCADO_PAGO_PUBLIC_KEY);
}

// Remover a declaração duplicada de Window.MercadoPago aqui, pois já existe em types/mercadopago.d.ts
export {};
