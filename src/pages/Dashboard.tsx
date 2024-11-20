import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useEmpresaId } from '../hooks/useEmpresaId';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const empresaId = useEmpresaId();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    recentActivities: []
  });

  useEffect(() => {
    async function fetchStats() {
      if (!empresaId) return;
      
      const { data: users } = await supabase
        .from('perfis')
        .select('count')
        .eq('empresa_id', empresaId);

      const { data: clients } = await supabase
        .from('clientes')
        .select('count')
        .eq('empresa_id', empresaId);

      // ... atualizar stats
    }
    
    fetchStats();
  }, [empresaId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total de Empresas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Nenhuma atividade recente</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
