declare namespace MercadoPago {
  interface CheckoutOptions {
    preference: {
      id: string;
    };
    render: {
      container: string;
      label?: string;
    };
    theme?: {
      elementsColor?: string;
      headerColor?: string;
    };
  }

  interface MercadoPagoInstance {
    checkout: (options: CheckoutOptions) => any;
  }
}

declare interface Window {
  MercadoPago: new (publicKey: string) => MercadoPago.MercadoPagoInstance;
}
