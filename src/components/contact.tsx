import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; // Assuming firebase config is in lib/firebase.ts
import { doc, getDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Digite um e-mail válido" }),
  subject: z
    .string()
    .min(5, { message: "O assunto deve ter pelo menos 5 caracteres" }),
  message: z
    .string()
    .min(10, { message: "A mensagem deve ter pelo menos 10 caracteres" }),
});

type ContactFormValues = z.infer<typeof formSchema>;

interface ContactProps {
  title: string;
  email: string;
  phone: string;
}

interface ContactData {
  address: string;
  email: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  showContactForm?: boolean; // Add the new field
}

const Contact: React.FC<ContactProps> = ({ title }) => {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [showForm, setShowForm] = useState(true); // State for form visibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const docRef = doc(db, "siteConfig", "sections");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.contact) {
            setContactData(data.contact as ContactData);
            // Set showForm based on fetched data, default to true if not present
            setShowForm(data.contact.showContactForm !== false);
          } else {
            setError("Contact data not found in document.");
            setShowForm(true); // Default to showing form if data is missing
          }
        } else {
          setError("Site config document not found.");
          setShowForm(true); // Default to showing form if document is missing
        }
      } catch (err) {
        console.error("Error fetching contact data:", err);
        setError("Failed to fetch contact data.");
        setShowForm(true); // Default to showing form on error
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    const phone = import.meta.env.VITE_WHATSAPP_PHONE || '5599999999999';
    const text = encodeURIComponent(
      `Olá! Meu nome é ${data.name}.\nAssunto: ${data.subject}\nMensagem: ${data.message}`
    );
    const waUrl = `https://wa.me/${phone}?text=${text}`;
    window.open(waUrl, '_blank');
    form.reset();
  };

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">{title}</h1>

        <div className={`grid gap-8 ${showForm ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Entre em Contato</h2>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu.email@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assunto</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sobre o que deseja falar?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite sua mensagem aqui..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Enviar pelo WhatsApp
                  </Button>
                </form>
              </Form>
            </div>
          )}

          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-6">
                Informações de Contato
              </h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Endereço</h3>
                    {loading && <p className="text-gray-600">Carregando endereço...</p>}
                    {error && <p className="text-red-600">{error}</p>}
                    {contactData && <p className="text-gray-600">{contactData.address}</p>}
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Telefone</h3>
                    {/* Phone number is still from env for WhatsApp */}
                    <p className="text-gray-600">{import.meta.env.VITE_WHATSAPP_PHONE || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">E-mail</h3>
                    {loading && <p className="text-gray-600">Carregando e-mail...</p>}
                    {error && <p className="text-red-600">{error}</p>}
                    {contactData && <p className="text-gray-600">{contactData.email}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Horário de Atendimento</h2>

              {loading && <p className="text-gray-600">Carregando horário de atendimento...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {contactData && (
                <div className="space-y-2">
                  {/* Define the desired order of days */}
                  {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map(day => {
                    const hours = contactData.openingHours[day];
                    // Only render if the day exists in the fetched data
                    if (hours) {
                      return (
                        <div key={day} className="flex justify-between">
                          <span className="font-medium">{day}:</span>
                          <span>{hours.open} - {hours.close}</span>
                        </div>
                      );
                    }
                    return null; // Don't render if day data is missing
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
