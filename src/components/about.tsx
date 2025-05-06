import React from "react";

const About = () => {
  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Sobre Nós</h1>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Nossa História</h2>
          <p className="text-gray-700 mb-6">
            Fundada em 2023, a E-Shop nasceu com uma missão simples: oferecer
            produtos de alta qualidade a preços acessíveis, proporcionando uma
            experiência de compra excepcional. O que começou como uma pequena
            loja online se tornou um destino confiável de e-commerce para
            clientes de todo o Brasil.
          </p>

          <div className="aspect-video mb-8 overflow-hidden rounded-md">
            <img
              src="https://images.unsplash.com/photo-1542744173-8659d8bde7ef?w=1200&q=80"
              alt="Our Team"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-2xl font-semibold mb-4">Nossos Valores</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 border rounded-md">
              <h3 className="text-xl font-medium mb-2">Qualidade</h3>
              <p className="text-gray-600">
                Selecionamos cuidadosamente cada produto para garantir que
                atenda aos nossos altos padrões de qualidade e durabilidade.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-xl font-medium mb-2">Sustentabilidade</h3>
              <p className="text-gray-600">
                Temos compromisso com a redução do impacto ambiental por meio de
                práticas sustentáveis e produtos ecológicos.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-xl font-medium mb-2">Atendimento</h3>
              <p className="text-gray-600">
                Acreditamos em colocar o cliente em primeiro lugar, com suporte
                ágil e uma experiência de compra sem complicações.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Nosso Time</h2>
          <p className="text-gray-700 mb-6">
            Nosso time diverso é apaixonado por criar a melhor experiência de
            compra possível. Da curadoria de produtos ao suporte ao cliente,
            trabalhamos juntos para garantir sua satisfação em cada pedido.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                  alt="John Doe"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium">John Doe</h3>
              <p className="text-gray-500">Fundador & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
                  alt="Jane Smith"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium">Jane Smith</h3>
              <p className="text-gray-500">Chefe de Operações</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
                  alt="Mike Johnson"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium">Mike Johnson</h3>
              <p className="text-gray-500">Experiência do Cliente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
