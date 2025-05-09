// ecomerce/src/services/melhorEnvioService.ts

// IMPORTANT SECURITY NOTE: Calling the Melhor Envio API directly from the frontend
// exposes your API secret key in the browser. This is a security risk.
// The recommended secure approach is to use a backend (like Firebase Cloud Functions)
// to make these API calls. This implementation is based on your explicit instruction
// to proceed despite the risks.

const MELHOR_ENVIO_API_URL = "https://sandbox.melhorenvio.com.br/api/v2"; // Use sandbox for development

// Ensure these environment variables are set up in your .env or .env.local file
// VITE_MELHOR_ENVIO_CLIENT_ID=your_client_id
// VITE_MELHOR_ENVIO_SECRET=your_secret_key
const CLIENT_ID = import.meta.env.VITE_MELHOR_ENVIO_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_MELHOR_ENVIO_SECRET;

// Helper function to make authenticated API requests to Melhor Envio
const melhorEnvioApiRequest = async (endpoint: string, method: string = 'GET', data?: any) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Melhor Envio API credentials are not set in environment variables.");
    throw new Error("Melhor Envio API credentials missing.");
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CLIENT_SECRET}`, // NOTE: Using Secret directly in frontend is insecure
    'X-Client-Id': CLIENT_ID,
  };

  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(`${MELHOR_ENVIO_API_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Melhor Envio API Error: ${response.status}`, errorData);
      throw new Error(`Melhor Envio API Error: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error making request to Melhor Envio API:", error);
    throw error;
  }
};

// Function to create a shipment in Melhor Envio
// This is a simplified example; the actual payload will depend on Melhor Envio's API docs
export const createMelhorEnvioShipment = async (orderData: any) => {
  // The payload structure here needs to match Melhor Envio's API documentation
  // It will likely include sender and recipient addresses, package dimensions/weight, etc.
  const shipmentPayload = {
    // ... construct payload from orderData ...
    // Example structure (refer to Melhor Envio API docs for actual required fields):
    from: {
      name: "Your Name",
      phone: "your_phone",
      email: "your_email",
      document: "your_document", // CPF/CNPJ
      address: "your_address",
      number: "your_number",
      district: "your_district",
      city: "your_city",
      state: "your_state",
      country_id: "BR",
      postal_code: "your_postal_code",
      // ... other sender fields
    },
    to: {
      name: "Recipient Name",
      phone: "recipient_phone",
      email: "recipient_email",
      document: "recipient_document", // CPF/CNPJ
      address: orderData.shippingAddress.street,
      number: orderData.shippingAddress.number, // Assuming number is part of address
      district: orderData.shippingAddress.district, // Assuming district is part of address
      city: orderData.shippingAddress.city,
      state: orderData.shippingAddress.state,
      country_id: "BR", // Assuming Brazil
      postal_code: orderData.shippingAddress.zipCode,
      // ... other recipient fields
    },
    products: orderData.items.map((item: any) => ({
      id: item.productId,
      quantity: item.quantity,
      // ... other product fields like weight, height, width, length
    })),
    package: {
        weight: orderData.packageWeight, // Total package weight
        height: orderData.packageHeight, // Total package height
        width: orderData.packageWidth,   // Total package width
        length: orderData.packageLength, // Total package length
    },
    // ... other shipment options (service, insurance, etc.)
  };

  // NOTE: This endpoint might be different depending on Melhor Envio's workflow
  // (e.g., calculate first, then add to cart, then checkout)
  // Refer to Melhor Envio API documentation for the correct endpoint and payload
  const endpoint = "/api/v2/me/shipment/generate"; // Example endpoint

  try {
    const result = await melhorEnvioApiRequest(endpoint, 'POST', shipmentPayload);
    console.log("Melhor Envio shipment creation result:", result);
    return result; // Contains Melhor Envio order ID, tracking info, label URL, etc.
  } catch (error) {
    console.error("Failed to create Melhor Envio shipment:", error);
    throw error;
  }
};

// Function to get shipment status from Melhor Envio
// This might require a different endpoint and potentially still the secret key.
// Check Melhor Envio API documentation for details.
export const getMelhorEnvioShipmentStatus = async (melhorEnvioOrderId: string) => {
    // This endpoint and payload are examples. Refer to Melhor Envio API docs.
    const endpoint = `/api/v2/me/shipment/tracking/${melhorEnvioOrderId}`; // Example endpoint

    try {
        const result = await melhorEnvioApiRequest(endpoint, 'GET');
        console.log(`Melhor Envio tracking status for ${melhorEnvioOrderId}:`, result);
        return result; // Contains tracking history
    } catch (error) {
        console.error(`Failed to get Melhor Envio shipment status for ${melhorEnvioOrderId}:`, error);
        throw error;
    }
};

export interface MelhorEnvioShippingOption {
  id: number;
  name: string;
  price: string; // Price is often returned as a string
  company: {
    id: number;
    name: string;
    picture: string;
  };
  delivery_time: number; // Estimated delivery time in days
  // Add other relevant fields from the API response
}

// Interface for the payload to calculate shipping
interface CalculateShippingPayload {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  products: Array<{
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
  }>;
  // Add other optional parameters like services, options, etc.
}


// Function to calculate shipping cost using Melhor Envio
export const calculateShipping = async (payload: CalculateShippingPayload): Promise<MelhorEnvioShippingOption[]> => {
  const endpoint = "/api/v2/me/shipment/calculate";

  try {
    const result = await melhorEnvioApiRequest(endpoint, 'POST', payload);
    // The API response structure for calculation might be different from shipment creation.
    // It should be an array of shipping options.
    // We need to ensure the returned data matches the MelhorEnvioShippingOption interface.
    // Basic validation: check if result is an array and has expected properties
    if (Array.isArray(result)) {
        // Filter out options with errors if any
        const validOptions = result.filter((option: any) => !option.error);
        // Map to our interface, ensuring price is a string
        return validOptions.map((option: any) => ({
            id: option.id,
            name: option.name,
            price: String(option.price), // Ensure price is a string
            company: option.company,
            delivery_time: option.delivery_time,
            // Map other fields as needed
        })) as MelhorEnvioShippingOption[];
    } else {
        console.error("Melhor Envio calculateShipping: Unexpected API response format", result);
        throw new Error("Unexpected shipping calculation response.");
    }

  } catch (error) {
    console.error("Failed to calculate shipping:", error);
    throw error;
  }
};