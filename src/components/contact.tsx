import React from "react";
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

const Contact = () => {
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
    const phone = import.meta.env.VITE_WHATSAPP_PHONE || '5599999999999'; // Número do WhatsApp agora vem do .env
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
        <h1 className="text-4xl font-bold mb-8 text-center">Fale Conosco</h1>

        <div className="grid md:grid-cols-2 gap-8">
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
                    <p className="text-gray-600">
                      Rua Principal, 123
                      <br />
                      Cidade, Estado 12345
                      <br />
                      Brasil
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Telefone</h3>
                    <p className="text-gray-600">(11) 99999-9999</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">E-mail</h3>
                    <p className="text-gray-600">info@eshop.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Horário de Atendimento</h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Segunda a Sexta:</span>
                  <span>09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sábado:</span>
                  <span>10:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Domingo:</span>
                  <span>Fechado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
