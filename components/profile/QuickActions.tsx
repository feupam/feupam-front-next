'use client';

import { 
  Edit, 
  Lock, 
  Shield, 
  Settings, 
  Bell, 
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onEditProfile: () => void;
  onLogout: () => void;
}

export function QuickActions({ onEditProfile, onLogout }: QuickActionsProps) {
  const actions = [
    {
      icon: Edit,
      label: 'Editar Dados Pessoais',
      description: 'Atualizar informações do perfil',
      onClick: onEditProfile,
      variant: 'default' as const
    },
    {
      icon: Lock,
      label: 'Alterar Senha',
      description: 'Modificar senha de acesso',
      onClick: () => console.log('Change password'),
      variant: 'outline' as const
    },
    {
      icon: Shield,
      label: 'Segurança',
      description: 'Configurar autenticação em dois fatores',
      onClick: () => console.log('Security settings'),
      variant: 'outline' as const
    },
    {
      icon: Bell,
      label: 'Notificações',
      description: 'Gerenciar preferências de notificação',
      onClick: () => console.log('Notification settings'),
      variant: 'outline' as const
    },
    {
      icon: HelpCircle,
      label: 'Ajuda e Suporte',
      description: 'Central de ajuda e contato',
      onClick: () => console.log('Help center'),
      variant: 'outline' as const
    },
    {
      icon: LogOut,
      label: 'Sair da Conta',
      description: 'Fazer logout do aplicativo',
      onClick: onLogout,
      variant: 'outline' as const,
      destructive: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            onClick={action.onClick}
            className={`w-full justify-start h-auto p-4 ${
              action.destructive ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''
            }`}
          >
            <div className="flex items-center w-full">
              <action.icon className={`h-5 w-5 mr-3 ${action.destructive ? 'text-red-500' : ''}`} />
              <div className="flex-1 text-left">
                <div className="font-medium">{action.label}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
