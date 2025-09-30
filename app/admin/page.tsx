'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventManagement } from '@/components/admin/EventManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { SpotManagement } from '@/components/admin/SpotManagement';
import { UserConsultation } from '@/components/admin/UserConsultation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAdmin } from '@/lib/admin';
import { AlertCircle, Shield } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Verificar se o usuário tem permissão de admin
  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">Acesso Negado</CardTitle>
            <CardDescription>
              Email inválido para acesso administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Seu email <strong>{user.email}</strong> não tem permissões para acessar esta área.
            </p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com os responsáveis se acredita que isso é um erro.
            </p>
            <div className="pt-4">
              <button
                onClick={() => router.back()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Voltar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie eventos, usuários e vagas</p>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="spots">Vagas</TabsTrigger>
          <TabsTrigger value="consultations">Consultas</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Eventos</CardTitle>
              <CardDescription>
                Criar, editar e excluir eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerenciar usuários, staff e permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spots">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Vagas</CardTitle>
              <CardDescription>
                Verificar vagas, aplicar descontos e inscrições gratuitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpotManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle>Consultas de Usuários e Reservas</CardTitle>
              <CardDescription>
                Consultar usuários e suas reservas por evento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserConsultation />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
