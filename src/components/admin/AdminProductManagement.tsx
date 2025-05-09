import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product as FirestoreProduct,
} from "@/lib/products";
import { CategoriaFiltro } from "@/lib/siteConfig";

// Define o schema do produto
const productSchema = z.object({
  name: z.string().min(1, { message: "Nome do produto é obrigatório" }),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  price: z.coerce.number().positive({ message: "Preço deve ser positivo" }),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
  imageUrl: z.string().url({ message: "URL da imagem é obrigatória" }),
  stock: z.coerce.number().int().nonnegative({ message: "Estoque deve ser um número inteiro não negativo" }),
  genero: z.enum(["masculino", "feminino"], { message: "Selecione o gênero" }),
  tamanho: z.enum(["P", "M", "G", "GG", "XGG", "EXG"], { message: "Selecione o tamanho" }),
  anoModelo: z.coerce.number().int().min(1978).max(1997),
  cor: z.enum(["Azul", "Branco", "Cinza", "Preto"], { message: "Selecione a cor" }),
  regiaoTime: z.enum(["Sudeste", "Nordeste", "Sul", "Centro-oeste"], { message: "Selecione a região" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Explicit enum types
type GeneroType = z.infer<typeof productSchema.shape.genero>;
type TamanhoType = z.infer<typeof productSchema.shape.tamanho>;
type CorType = z.infer<typeof productSchema.shape.cor>;
type RegiaoTimeType = z.infer<typeof productSchema.shape.regiaoTime>;

// Helper function to safely get enum values
function getSafeEnum<TValue extends string, TEnum extends readonly TValue[]>(
  value: string | undefined,
  enumOptions: TEnum,
  defaultValue: TEnum[number]
): TEnum[number] {
  if (value && (enumOptions as unknown as string[]).includes(value)) {
    return value as TEnum[number];
  }
  return defaultValue;
}
interface AdminProductManagementProps {
  catFiltro: CategoriaFiltro | null;
}

const AdminProductManagement: React.FC<AdminProductManagementProps> = ({ catFiltro }) => {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<FirestoreProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Default values with correct enum types
  const defaultCategories = ["Eletrônicos", "Roupas", "Casa", "Livros", "Esportes"];
  const defaultTamanhos: TamanhoType[] = ["P", "M", "G", "GG", "XGG", "EXG"];
  const defaultGeneros: GeneroType[] = ["masculino", "feminino"];
  const defaultCores: CorType[] = ["Azul", "Branco", "Cinza", "Preto"];
  const defaultRegioes: RegiaoTimeType[] = ["Sudeste", "Nordeste", "Sul", "Centro-oeste"];
  const defaultAnos = Array.from({ length: 1997 - 1978 + 1 }, (_, i) => 1978 + i);

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: defaultCategories[0] || "",
      imageUrl: "",
      stock: 0,
      genero: defaultGeneros[0] || "masculino",
      tamanho: defaultTamanhos[0] || "P",
      anoModelo: defaultAnos[0] || 1978,
      cor: defaultCores[0] || "Azul",
      regiaoTime: defaultRegioes[0] || "Sudeste",
    },
  });

  useEffect(() => {
    if (editingProduct) {
      productForm.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        imageUrl: editingProduct.image,
        stock: editingProduct.stock,
        genero: editingProduct.genero, // Already correct type from FirestoreProduct
        tamanho: editingProduct.tamanho, // Already correct type
        anoModelo: editingProduct.anoModelo,
        cor: editingProduct.cor, // Already correct type
        regiaoTime: editingProduct.regiaoTime, // Already correct type
      });
    } else {
      // For new product, use catFiltro or fall back to defaults
      productForm.reset({
        name: "",
        description: "",
        price: 0,
        category: catFiltro?.categorias?.[0] || defaultCategories[0] || "",
        imageUrl: "",
        stock: 0,
        genero: getSafeEnum(catFiltro?.generos?.[0], productSchema.shape.genero.options, defaultGeneros[0]),
        tamanho: getSafeEnum(catFiltro?.tamanhos?.[0], productSchema.shape.tamanho.options, defaultTamanhos[0]),
        anoModelo: catFiltro?.anos?.[0] || defaultAnos[0] || 1978,
        cor: getSafeEnum(catFiltro?.cores?.[0], productSchema.shape.cor.options, defaultCores[0]),
        regiaoTime: getSafeEnum(catFiltro?.regioes?.[0], productSchema.shape.regiaoTime.options, defaultRegioes[0]),
      });
    }
  }, [editingProduct, productForm, catFiltro, defaultCategories, defaultGeneros, defaultTamanhos, defaultCores, defaultRegioes, defaultAnos]);

  const categoriasOptions = catFiltro?.categorias?.length ? catFiltro.categorias : defaultCategories;
  const generosOptions = catFiltro?.generos?.length ? catFiltro.generos : defaultGeneros;
  const tamanhosOptions = catFiltro?.tamanhos?.length ? catFiltro.tamanhos : defaultTamanhos;
  const coresOptions = catFiltro?.cores?.length ? catFiltro.cores : defaultCores;
  const regioesOptions = catFiltro?.regioes?.length ? catFiltro.regioes : defaultRegioes;
  const anosOptions = catFiltro?.anos?.length ? catFiltro.anos : defaultAnos;


  const onSubmitProduct = async (data: ProductFormValues) => {
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.imageUrl, // unifica para 'image'
      stock: data.stock,
      genero: data.genero,
      tamanho: data.tamanho,
      anoModelo: data.anoModelo,
      cor: data.cor,
      regiaoTime: data.regiaoTime,
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

  const handleDeleteProduct = async () => {
    if (deleteProductId !== null) {
      await deleteProduct(deleteProductId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProductId));
      setDeleteProductId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    setEditingProduct(null);
    // Reset form with potentially new default values from catFiltro
    productForm.reset({
        name: "",
        description: "",
        price: 0,
        category: catFiltro?.categorias?.[0] || defaultCategories[0] || "",
        imageUrl: "",
        stock: 0,
        genero: getSafeEnum(catFiltro?.generos?.[0], productSchema.shape.genero.options, defaultGeneros[0]),
        tamanho: getSafeEnum(catFiltro?.tamanhos?.[0], productSchema.shape.tamanho.options, defaultTamanhos[0]),
        anoModelo: catFiltro?.anos?.[0] || defaultAnos[0] || 1978,
        cor: getSafeEnum(catFiltro?.cores?.[0], productSchema.shape.cor.options, defaultCores[0]),
        regiaoTime: getSafeEnum(catFiltro?.regioes?.[0], productSchema.shape.regiaoTime.options, defaultRegioes[0]),
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: FirestoreProduct) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);

  return (
    <>
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
                className="space-y-4 max-h-[70vh] overflow-y-auto p-2"
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
                          {categoriasOptions.map((category) => (
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
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {generosOptions.map((g) => (
                            <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="tamanho"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tamanhosOptions.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="anoModelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano Modelo</FormLabel>
                      <Select onValueChange={v => field.onChange(Number(v))} value={String(field.value)} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o ano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {anosOptions.map((ano) => (
                            <SelectItem key={ano} value={String(ano)}>{ano}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="cor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {coresOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="regiaoTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Região do time</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a região" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regioesOptions.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
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
                <TableHead>Gênero</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Região</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11} // Adjusted colspan
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
                    <TableCell>{product.genero}</TableCell>
                    <TableCell>{product.tamanho}</TableCell>
                    <TableCell>{product.anoModelo}</TableCell>
                    <TableCell>{product.cor}</TableCell>
                    <TableCell>{product.regiaoTime}</TableCell>
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
    </>
  );
};

export default AdminProductManagement;