import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Cliente {
  id: string;
  nome: string;
}

interface ClienteSearchProps {
  onClienteSelect: (clienteId: string) => void;
  selectedClienteId?: string;
}

export function ClienteSearch({ onClienteSelect, selectedClienteId }: ClienteSearchProps) {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { empresaId } = useAuth();
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    if (selectedClienteId) {
      fetchClienteById(selectedClienteId);
    }
  }, [selectedClienteId]);

  const fetchClienteById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedCliente(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    }
  };

  const searchClientes = async (search: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('empresa_id', empresaId)
        .ilike('nome', `%${search}%`)
        .order('nome')
        .limit(10);

      if (error) throw error;
      
      setClientes(data || []);
      
      console.log('Resultados encontrados:', data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchClientes(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white"
        >
          {selectedCliente ? selectedCliente.nome : "Selecione um cliente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 shadow-md bg-white" 
        align="start"
        sideOffset={4}
        style={{ 
          width: 'var(--radix-popover-trigger-width)',
          minWidth: '400px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 50
        }}
      >
        <Command className="w-full border-none bg-white rounded-lg">
          <CommandInput
            placeholder="Buscar cliente..."
            value={searchTerm}
            onValueChange={(value) => {
              setSearchTerm(value);
              if (!value) {
                searchClientes('');
              }
            }}
            className="border-none focus:ring-0"
          />
          <CommandEmpty className="py-2 px-4 text-sm text-gray-500">
            {loading ? "Buscando..." : "Nenhum cliente encontrado."}
          </CommandEmpty>
          <CommandGroup className="overflow-hidden bg-white">
            {clientes.map((cliente) => (
              <CommandItem
                key={cliente.id}
                value={cliente.nome}
                onSelect={() => {
                  setSelectedCliente(cliente);
                  onClienteSelect(cliente.id);
                  setOpen(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedClienteId === cliente.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>{cliente.nome}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 