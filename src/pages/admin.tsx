import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Pencil, Trash2, Search, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product as FirestoreProduct,
} from "@/lib/products";

// Define o schema do produto
const productSchema = z.object({
  name: z.string().min(1, { message: "Nome do produto é obrigatório" }),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  price: z.coerce.number().positive({ message: "Preço deve ser positivo" }),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
  imageUrl: z.string().url({ message: "URL da imagem é obrigatória" }),
  stock: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Estoque deve ser um número inteiro não negativo" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Mock categories
const categories = ["Eletrônicos", "Roupas", "Casa", "Livros", "Esportes"];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<
    FirestoreProduct | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Formulário de login
  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Formulário de produto
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
      stock: 0,
    },
  });

  // Reset form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      productForm.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        imageUrl: editingProduct.image, // Corrigido: deve ser imageUrl
        stock: editingProduct.stock,
      });
    } else {
      productForm.reset({
        name: "",
        description: "",
        price: 0,
        category: "",
        imageUrl: "",
        stock: 0,
      });
    }
  }, [editingProduct, productForm]);

  // Handle login
  const handleLogin = (data: { username: string; password: string }) => {
    // In a real app, this would validate against a database
    if (data.username === "admin" && data.password === "password") {
      setIsAuthenticated(true);
    } else {
      alert("Credenciais inválidas");
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Handle product form submission
  const onSubmitProduct = async (data: ProductFormValues) => {
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.imageUrl, // unifica para 'image'
      stock: data.stock,
    };
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...p, ...productData } : p
        )
      );
    } else {
      const id = await addProduct(productData);
      setProducts((prev) => [
        ...prev,
        { ...productData, id },
      ]);
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (deleteProductId !== null) {
      await deleteProduct(deleteProductId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProductId));
      setDeleteProductId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Open dialog for adding new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing product
  const handleEditProduct = (product: FirestoreProduct) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  // Open dialog for deleting product
  const handleConfirmDelete = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  // Carregar produtos do Firestore ao montar
  useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">Login do Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="senha"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Gerenciamento de Produtos</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddProduct}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do produto e clique em salvar.
                  </DialogDescription>
                </DialogHeader>
                <Form {...productForm}>
                  <form
                    onSubmit={productForm.handleSubmit(onSubmitProduct)}
                    className="space-y-4"
                  >
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Produto</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Fone de Ouvido Bluetooth"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descrição detalhada do produto..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço (R$)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estoque</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={productForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Imagem</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://exemplo.com/imagem.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">
                        {editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
