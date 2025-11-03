'use client';

import { User, Phone, Shield, Edit, HomeIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/src/features/auth';
import type { UserProfile } from '@/types/user';
import { isAdmin } from '@/lib/admin';
import { formatPhone as formatPhoneNumber, maskEmail, maskPhone } from '@/lib/utils';

interface UserProfileCardProps {
  profile: UserProfile;
  onEditProfile: () => void;
}

export function UserProfileCard({ profile, onEditProfile }: UserProfileCardProps) {
  const { user } = useAuth(); // Para pegar a foto do Firebase Auth
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwnProfile = user?.email && profile.email && user.email === profile.email;
  const canViewSensitive = Boolean(isOwnProfile || isAdmin(user));

  return (
    <Card className="w-full">
      {/* Header com Avatar e Nome */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-white">
            <AvatarImage src={user?.photoURL || profile.photoURL || undefined} />
            <AvatarFallback className="bg-white text-emerald-600 text-lg font-semibold">
              {getInitials(profile.name || user?.displayName || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile.name || 'Nome não informado'}</h1>
            <p className="text-emerald-100">{profile.email}</p>
            <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-white/30">
              {profile.userType === 'client' ? 'Participante' : profile.userType}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditProfile}
            className="text-white hover:bg-white/20"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Informações Pessoais */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center text-foreground">
            <User className="h-4 w-4 mr-2" />
            Informações Pessoais
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome:</span>
              <span>{profile.name || 'Nome não informado'}</span>
            </div>
            {profile.idade && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idade:</span>
                <span>{profile.idade} anos</span>
              </div>
            )}
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center text-foreground">
            <Phone className="h-4 w-4 mr-2" />
            Contato
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="break-all">{canViewSensitive ? profile.email : maskEmail(profile.email)}</span>
            </div>
            {(profile.ddd && profile.cellphone) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone:</span>
                <span>
                  {canViewSensitive
                    ? formatPhoneNumber(`${profile.ddd}${profile.cellphone}`)
                    : maskPhone(`${profile.ddd}${profile.cellphone}`)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Igreja */}
        {profile.church && canViewSensitive && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center text-foreground">
              <HomeIcon className="h-4 w-4 mr-2" />
              Igreja
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Igreja:</span>
                <span className="text-right">{profile.church}</span>
              </div>
              {profile.pastor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pastor:</span>
                  <span>{profile.pastor}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
