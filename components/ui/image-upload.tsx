'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Eye } from 'lucide-react';
import { 
  validateJpgImage, 
  createImagePreview, 
  validateImageDimensions,
  IMAGE_REQUIREMENTS,
  type ImageValidationResult 
} from '@/lib/utils/image-validation';

interface ImageUploadProps {
  label: string;
  imageType: keyof typeof IMAGE_REQUIREMENTS;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
}

export function ImageUpload({ 
  label, 
  imageType, 
  value, 
  onChange, 
  error, 
  required = false 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requirements = imageType ? IMAGE_REQUIREMENTS[imageType] : null;

  const handleFileSelect = useCallback(async (file: File) => {
    console.log(`[ImageUpload] Selecionando arquivo: ${file.name}, tipo: ${file.type}, tamanho: ${file.size} bytes`);
    setIsValidating(true);
    setValidationError(null);

    try {
      // Validação básica de JPG
      const basicValidation = validateJpgImage(file);
      if (!basicValidation.isValid) {
        console.error(`[ImageUpload] Validação básica falhou: ${basicValidation.error}`);
        setValidationError(basicValidation.error || 'Arquivo inválido');
        setIsValidating(false);
        return;
      }

      // Validação de dimensões
      const dimensionValidation = await validateImageDimensions(file, imageType);
      if (!dimensionValidation.isValid) {
        console.error(`[ImageUpload] Validação de dimensões falhou: ${dimensionValidation.error}`);
        setValidationError(dimensionValidation.error || 'Dimensões inválidas');
        setIsValidating(false);
        return;
      }

      // Criar prévia
      const previewUrl = await createImagePreview(file);
      console.log(`[ImageUpload] Prévia criada com sucesso para: ${file.name}`);
      setPreview(previewUrl);
      onChange(file);
      console.log(`[ImageUpload] Arquivo ${file.name} aceito e enviado para o componente pai`);
      
    } catch (err) {
      console.error('[ImageUpload] Erro ao processar imagem:', err);
      setValidationError('Erro ao processar imagem');
    } finally {
      setIsValidating(false);
    }
  }, [imageType, onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setValidationError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = validationError || error;

  return (
    <div className="space-y-2">
      <Label htmlFor={`upload-${imageType}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="text-sm text-muted-foreground">
        {requirements?.description || 'Selecione uma imagem'}
      </div>

      <div className="space-y-4">
        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          id={`upload-${imageType}`}
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Área de upload ou prévia */}
        {!value || !preview ? (
          <Card 
            className={`border-dashed border-2 cursor-pointer hover:border-primary transition-colors ${
              displayError ? 'border-red-500' : 'border-gray-300'
            }`}
            onClick={handleClick}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Clique para selecionar</span> ou arraste a imagem
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                JPG/JPEG - Qualquer tamanho
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Prévia da imagem */}
                <div className="relative">
                  <img
                    src={preview}
                    alt={`Prévia ${label}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemove}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Informações do arquivo */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {value.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClick}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Trocar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Indicador de carregamento */}
        {isValidating && (
          <div className="text-sm text-muted-foreground text-center">
            Validando imagem...
          </div>
        )}

        {/* Mensagem de erro */}
        {displayError && (
          <div className="text-sm text-red-500">
            {displayError}
          </div>
        )}

        {/* Informações de requisitos */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <div className="font-medium mb-1">Recomendação:</div>
          <ul className="space-y-1">
            <li>• Formato: JPG/JPEG</li>
            <li>• Tamanho: Sem limitação</li>
            {requirements && (
              <>
                <li>• Dimensões recomendadas: {requirements.recommendedWidth}x{requirements.recommendedHeight}px</li>
                <li>• Proporção: {requirements.aspectRatio}</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
