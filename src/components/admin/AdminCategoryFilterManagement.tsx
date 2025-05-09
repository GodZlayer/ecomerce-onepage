import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component
import { Trash2 } from "lucide-react";
import {
    getCategoriaFiltro,
    setCategoriaFiltro,
    CategoriaFiltro,
    getFiltrosAtivosConfig,
    setFiltrosAtivosConfig,
    FiltrosAtivosConfig
} from "@/lib/siteConfig";

interface AdminCategoryFilterManagementProps {
    // Props if needed, e.g., for shared state or callbacks
}

const AdminCategoryFilterManagement: React.FC<AdminCategoryFilterManagementProps> = () => {
    const [catFiltro, setCatFiltro] = useState<CategoriaFiltro | null>(null);
    const [loadingCatFiltro, setLoadingCatFiltro] = useState(true);
    const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivosConfig | null>(null);
    const [loadingFiltrosAtivos, setLoadingFiltrosAtivos] = useState(true);
    const [newCategoryValues, setNewCategoryValues] = useState<Record<string, string>>({});
    const [newFilterName, setNewFilterName] = useState("");

    useEffect(() => {
        getCategoriaFiltro().then((data) => {
            setCatFiltro(data);
            setLoadingCatFiltro(false);
        });
        getFiltrosAtivosConfig().then((data) => {
            setFiltrosAtivos(data);
            setLoadingFiltrosAtivos(false);
        });
    }, []);

    const handleAddFilterValue = async (filterKey: keyof CategoriaFiltro, valueToAdd: string) => {
        if (!catFiltro || !valueToAdd.trim()) return;

        const currentValues = catFiltro[filterKey] as string[] | number[] | undefined;
        if (!currentValues) return; // Should not happen if initialized correctly

        let newValue: string | number = valueToAdd.trim();
        // Assuming 'anos' is the only numeric filter key from CategoriaFiltro
        if (filterKey === 'anos') {
            newValue = Number(newValue);
            if (isNaN(newValue)) {
                alert("Ano deve ser um número.");
                return;
            }
        }

        if (currentValues.includes(newValue as never)) {
            alert(`"${newValue}" já existe em ${filterKey}.`);
            return;
        }

        const updatedValues = [...currentValues, newValue as never];
        const novoCatFiltro = { ...catFiltro, [filterKey]: updatedValues };
        setCatFiltro(novoCatFiltro);
        await setCategoriaFiltro(novoCatFiltro);
        setNewCategoryValues(prev => ({ ...prev, [filterKey]: "" }));
    };

    const handleRemoveFilterValue = async (filterKey: keyof CategoriaFiltro, valueToRemove: string | number) => {
        if (!catFiltro) return;
        const currentValues = catFiltro[filterKey] as (string | number)[] | undefined;
        if (!currentValues) return;

        const updatedValues = currentValues.filter(v => v !== valueToRemove);
        const novoCatFiltro = { ...catFiltro, [filterKey]: updatedValues };
        setCatFiltro(novoCatFiltro);
        await setCategoriaFiltro(novoCatFiltro);
    };

    const handleToggleFiltroAtivo = async (key: keyof FiltrosAtivosConfig) => {
        if (!filtrosAtivos) return;
        const novo = { ...filtrosAtivos, [key]: !filtrosAtivos[key] };
        setFiltrosAtivos(novo);
        await setFiltrosAtivosConfig(novo);
    };

    const handleAddNovoFiltro = async () => {
        if (!newFilterName.trim() || !filtrosAtivos || !catFiltro) return;
        const filterKey = newFilterName.trim().toLowerCase().replace(/\s+/g, '_'); // Sanitize name

        if (filterKey in filtrosAtivos) {
            alert(`Filtro "${filterKey}" já existe.`);
            return;
        }

        const novoFiltrosAtivos = { ...filtrosAtivos, [filterKey]: true };
        setFiltrosAtivos(novoFiltrosAtivos);
        await setFiltrosAtivosConfig(novoFiltrosAtivos);

        // Add corresponding empty array to catFiltro
        const novoCatFiltro = { ...catFiltro, [filterKey]: [] };
        setCatFiltro(novoCatFiltro);
        await setCategoriaFiltro(novoCatFiltro);

        setNewFilterName("");
    };

    const handleRemoveFiltro = async (filterKey: keyof FiltrosAtivosConfig) => {
        if (!filtrosAtivos || !catFiltro) return;
        if (!window.confirm(`Tem certeza que deseja excluir o filtro '${filterKey}' e todos os seus valores? Esta ação não pode ser desfeita.`)) return;

        const novoFiltrosAtivos = { ...filtrosAtivos };
        delete novoFiltrosAtivos[filterKey];
        setFiltrosAtivos(novoFiltrosAtivos);
        await setFiltrosAtivosConfig(novoFiltrosAtivos);

        const novoCatFiltro = { ...catFiltro };
        delete novoCatFiltro[filterKey as keyof CategoriaFiltro]; // Cast as it might not exist if freshly added
        setCatFiltro(novoCatFiltro);
        await setCategoriaFiltro(novoCatFiltro);
    };


    if (loadingCatFiltro || loadingFiltrosAtivos) {
        return <div className="text-center text-gray-500 py-8">Carregando configurações de categorias e filtros...</div>;
    }

    if (!catFiltro || !filtrosAtivos) {
        return <div className="text-center text-red-500 py-8">Erro ao carregar dados. Tente recarregar a página.</div>;
    }
    
    // Determine all keys from CategoriaFiltro for managing values.
    // The "Manage filter values" section should list all filter categories present in catFiltro.
    const allFilterKeysFromCatFiltro = Object.keys(catFiltro) as (keyof CategoriaFiltro)[];


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Gerenciar Tipos de Filtro Ativos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="Nome do novo tipo de filtro (ex: Marca)"
                            value={newFilterName}
                            onChange={(e) => setNewFilterName(e.target.value)}
                        />
                        <Button onClick={handleAddNovoFiltro}>Adicionar Tipo de Filtro</Button>
                    </div>
                    {Object.keys(filtrosAtivos).sort().map((key) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded-md">
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={filtrosAtivos[key as keyof FiltrosAtivosConfig]}
                                    onCheckedChange={() => handleToggleFiltroAtivo(key as keyof FiltrosAtivosConfig)}
                                    id={`switch-${key}`}
                                />
                                <label htmlFor={`switch-${key}`} className="text-sm">
                                    {filtrosAtivos[key as keyof FiltrosAtivosConfig] ? "Ativo" : "Inativo"}
                                </label>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveFiltro(key as keyof FiltrosAtivosConfig)} title="Excluir tipo de filtro">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Gerenciar Valores dos Filtros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {allFilterKeysFromCatFiltro.map((filterKey) => {
                        const values = catFiltro[filterKey] as (string | number)[];
                        const isNumeric = filterKey === 'anos'; // Assuming 'anos' is a specific numeric filter
                        return (
                            <div key={filterKey} className="p-4 border rounded-md">
                                <h3 className="text-lg font-semibold mb-3 capitalize">{filterKey.replace(/_/g, ' ')}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {values.length > 0 ? values.sort((a, b) => String(a).localeCompare(String(b))).map((val) => (
                                        <span key={String(val)} className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                            {String(val)}
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFilterValue(filterKey, val)} className="ml-1 p-0 h-auto">
                                                <Trash2 className="w-3 h-3 text-red-400 hover:text-red-600" />
                                            </Button>
                                        </span>
                                    )) : <span className="text-gray-400 text-sm">Nenhum valor cadastrado.</span>}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type={isNumeric ? "number" : "text"}
                                        placeholder={`Novo valor para ${filterKey.replace(/_/g, ' ')}`}
                                        value={newCategoryValues[filterKey] || ""}
                                        onChange={(e) => setNewCategoryValues(prev => ({ ...prev, [filterKey]: e.target.value }))}
                                        className="max-w-xs"
                                    />
                                    <Button onClick={() => handleAddFilterValue(filterKey, newCategoryValues[filterKey] || "")}>
                                        Adicionar Valor
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                     {allFilterKeysFromCatFiltro.length === 0 && (
                        <p className="text-gray-500">Nenhum tipo de filtro definido para gerenciar valores. Adicione tipos de filtro na seção "Gerenciar Tipos de Filtro Ativos" primeiro.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCategoryFilterManagement;