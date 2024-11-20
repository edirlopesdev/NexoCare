import React, { useState } from 'react';
import { ProdutoForm } from '../components/ProdutoForm';
import { ProdutoList } from '../components/ProdutoList';
import { Produto } from '../types/supabase-types';

type ModoFormulario = 'lista' | 'novo' | 'edicao';

export function ProdutosPage() {
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | undefined>(undefined);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const [modo, setModo] = useState<ModoFormulario>('lista');

  const handleEditProduto = (produto: Produto) => {
    setProdutoParaEditar(produto);
    setModo('edicao');
  };

  const handleNovoProduto = () => {
    setProdutoParaEditar(undefined);
    setModo('novo');
  };

  const handleProdutoSalvo = () => {
    setProdutoParaEditar(undefined);
    setTriggerRefetch(!triggerRefetch);
    setModo('lista');
  };

  const handleVoltar = () => {
    setProdutoParaEditar(undefined);
    setModo('lista');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Produtos</h1>
      <div className="space-y-6">
        {modo === 'lista' ? (
          <ProdutoList 
            onEditProduto={handleEditProduto}
            onNovoProduto={handleNovoProduto}
            triggerRefetch={triggerRefetch}
          />
        ) : (
          <ProdutoForm 
            produtoParaEditar={produtoParaEditar} 
            onProdutoSalvo={handleProdutoSalvo}
            onVoltar={handleVoltar}
          />
        )}
      </div>
    </div>
  );
}
