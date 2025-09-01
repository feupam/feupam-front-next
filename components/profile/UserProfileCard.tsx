'use client';

import { User, Phone, Mail, MapPin, Calendar, Shield, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/types/user';

interface UserProfileCardProps {
  profile: UserProfile;
  onEditProfile: () => void;
}

export function UserProfileCard({ profile, onEditProfile }: UserProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const maskCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.***-**');
  };

  const formatPhone = (ddd: string, phone: string) => {
    if (!ddd || !phone) return '';
    return `(${ddd}) ${phone.replace(/(\d{5})(\d{4})/, '$1-$2')}`;
  };

  return (
    <Card className="w-full">
      {/* Header com Avatar e Nome */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-white">
            <AvatarImage src={profile.photoURL} />
            <AvatarFallback className="bg-white text-blue-600 text-lg font-semibold">
              {getInitials(profile.name || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile.name || 'Nome não informado'}</h1>
            <p className="text-blue-100">{profile.email}</p>
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
          <h3 className="font-semibold mb-3 flex items-center text-gray-700">
            <User className="h-4 w-4 mr-2" />
            Informações Pessoais
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">CPF:</span>
              <span className="font-mono">{maskCPF(profile.cpf || '')}</span>
            </div>
            {profile.data_nasc && (
              <div className="flex justify-between">
                <span className="text-gray-600">Data de Nascimento:</span>
                <span>{new Date(profile.data_nasc).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {profile.idade && (
              <div className="flex justify-between">
                <span className="text-gray-600">Idade:</span>
                <span>{profile.idade} anos</span>
              </div>
            )}
            {profile.gender && (
              <div className="flex justify-between">
                <span className="text-gray-600">Gênero:</span>
                <span>{profile.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center text-gray-700">
            <Phone className="h-4 w-4 mr-2" />
            Contato
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="break-all">{profile.email}</span>
            </div>
            {(profile.ddd && profile.cellphone) && (
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone:</span>
                <span>{formatPhone(profile.ddd, profile.cellphone)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Endereço */}
        {(profile.cep || profile.address || profile.city) && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center text-gray-700">
              <MapPin className="h-4 w-4 mr-2" />
              Endereço
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {profile.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Logradouro:</span>
                  <span className="text-right">{profile.address}, {profile.number}</span>
                </div>
              )}
              {profile.neighborhood && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Bairro:</span>
                  <span>{profile.neighborhood}</span>
                </div>
              )}
              {profile.city && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cidade:</span>
                  <span>{profile.city} - {profile.state}</span>
                </div>
              )}
              {profile.cep && (
                <div className="flex justify-between">
                  <span className="text-gray-600">CEP:</span>
                  <span className="font-mono">{profile.cep}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Igreja */}
        {profile.church && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center text-gray-700">
              <Shield className="h-4 w-4 mr-2" />
              Igreja
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Igreja:</span>
                <span className="text-right">{profile.church}</span>
              </div>
              {profile.pastor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pastor:</span>
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
