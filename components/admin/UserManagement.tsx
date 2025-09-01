'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Fast User Creation
  const [fastUserEmail, setFastUserEmail] = useState('');

  // Set Staff
  const [staffEmail, setStaffEmail] = useState('');
  const [isStaff, setIsStaff] = useState(true);

  // Update Email
  const [updateEmailData, setUpdateEmailData] = useState({
    email: '',
    newEmail: ''
  });

  // Preencher emails automaticamente com o email do usuário logado
  useEffect(() => {
    if (user?.email) {
      setFastUserEmail(user.email);
      setStaffEmail(user.email);
      setUpdateEmailData(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  const handleFastUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/admin/fast-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: fastUserEmail })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
        });
        setFastUserEmail('');
      } else {
        throw new Error('Erro ao criar usuário');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/admin/set-staff', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: staffEmail, isStaff })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Usuário ${isStaff ? 'promovido a' : 'removido de'} staff com sucesso!`,
        });
        setStaffEmail('');
      } else {
        throw new Error('Erro ao alterar status de staff');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status de staff",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/admin/update-email', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateEmailData)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Email atualizado com sucesso!",
        });
        setUpdateEmailData({ email: '', newEmail: '' });
      } else {
        throw new Error('Erro ao atualizar email');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="fast-user" className="space-y-4">
      <TabsList>
        <TabsTrigger value="fast-user">Criar Usuário Rápido</TabsTrigger>
        <TabsTrigger value="staff">Gerenciar Staff</TabsTrigger>
        <TabsTrigger value="email">Atualizar Email</TabsTrigger>
      </TabsList>

      <TabsContent value="fast-user">
        <Card>
          <CardHeader>
            <CardTitle>Criar Usuário Rápido</CardTitle>
            <CardDescription>
              Cria um usuário com dados fake, apenas o email é real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFastUser} className="space-y-4">
              <div>
                <Label htmlFor="fastUserEmail">Email do Usuário</Label>
                <Input
                  id="fastUserEmail"
                  type="email"
                  value={fastUserEmail}
                  onChange={(e) => setFastUserEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="staff">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Staff</CardTitle>
            <CardDescription>
              Promover ou remover usuários da equipe de staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetStaff} className="space-y-4">
              <div>
                <Label htmlFor="staffEmail">Email do Usuário</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isStaff"
                  checked={isStaff}
                  onCheckedChange={setIsStaff}
                />
                <Label htmlFor="isStaff">
                  {isStaff ? 'Promover a Staff' : 'Remover de Staff'}
                </Label>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Atualizando...' : 'Atualizar Status'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>Atualizar Email</CardTitle>
            <CardDescription>
              Alterar o email de um usuário existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <Label htmlFor="currentEmail">Email Atual</Label>
                <Input
                  id="currentEmail"
                  type="email"
                  value={updateEmailData.email}
                  onChange={(e) => setUpdateEmailData({ ...updateEmailData, email: e.target.value })}
                  placeholder="email-atual@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newEmail">Novo Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={updateEmailData.newEmail}
                  onChange={(e) => setUpdateEmailData({ ...updateEmailData, newEmail: e.target.value })}
                  placeholder="novo-email@exemplo.com"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Atualizando...' : 'Atualizar Email'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
