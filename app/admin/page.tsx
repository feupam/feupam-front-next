'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventManagement, UserManagement, SpotManagement, UserConsultation, TotalConsultation } from '@/src/features/admin';
import { useAuth } from '@/src/features/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAdmin } from '@/lib/admin';
import { AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { ActionButton } from '@/components/shared/ActionButton';

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
              <ActionButton
                variant="default"
                icon={ArrowLeft}
                onClick={() => router.back()}
                className="w-full"
              >
                Voltar
              </ActionButton>
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
        {/* Tabs principais: quebram linha no mobile quando faltar espaço */}
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-2">
          <TabsTrigger className="flex-none" value="events">Eventos</TabsTrigger>
          <TabsTrigger className="flex-none" value="users">Usuários</TabsTrigger>
          <TabsTrigger className="flex-none" value="spots">Vagas</TabsTrigger>
          <TabsTrigger className="flex-none" value="consultations">Consultas</TabsTrigger>
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
                Consultar usuários e suas reservas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="by-event" className="w-full">
                {/* Sub-abas: quebram linha quando faltar espaço */}
                <TabsList className="w-full h-auto flex flex-wrap justify-start gap-2">
                  <TabsTrigger className="flex-none" value="by-event">Consulta por Evento</TabsTrigger>
                  <TabsTrigger className="flex-none" value="total">Consulta Total</TabsTrigger>
                </TabsList>

                <TabsContent value="by-event" className="mt-4">
                  <UserConsultation />
                </TabsContent>

                <TabsContent value="total" className="mt-4">
                  <TotalConsultation />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
