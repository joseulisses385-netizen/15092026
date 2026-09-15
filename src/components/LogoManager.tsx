import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, RotateCcw, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { OFFICIAL_BRAND_LOGO, OFFICIAL_FALLBACK_LOGO } from '../constants/assets';
import { fileToOptimizedDataUrl } from '../utils/imageHelper';
import { uploadLogoToServer, resetLogoOnServer } from '../services/storeApi';

interface LogoManagerProps {
  currentLogoUrl?: string;
  onLogoChange: (newUrl: string) => void;
  onShowToast?: (msg: string) => void;
}

export const LogoManager: React.FC<LogoManagerProps> = ({
  currentLogoUrl,
  onLogoChange,
  onShowToast,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLogo = currentLogoUrl || OFFICIAL_BRAND_LOGO;

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadSuccess(false);

    try {
      // 1. Process and optimize to dataUrl
      const dataUrl = await fileToOptimizedDataUrl(file, 1200, 0.95);

      // 2. Immediately send to server
      const serverUrl = await uploadLogoToServer(dataUrl);
      const finalUrl = serverUrl || dataUrl;

      // 3. Immediately apply to store & app
      onLogoChange(finalUrl);

      // 4. Also store in localStorage as safeguard
      try {
        localStorage.setItem('doidas_custom_logo', finalUrl);
      } catch {}

      setUploadSuccess(true);
      if (onShowToast) {
        onShowToast('Logo atualizada com sucesso em todo o site!');
      }

      setTimeout(() => {
        setUploadSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error('Erro ao atualizar logo:', err);
      setErrorMessage(err.message || 'Falha ao processar e enviar a imagem. Tente outro arquivo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = async () => {
    if (!urlInput.trim()) {
      setErrorMessage('Digite ou cole a URL de uma imagem válida.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const serverUrl = await uploadLogoToServer(urlInput.trim());
      const finalUrl = serverUrl || urlInput.trim();

      onLogoChange(finalUrl);
      try {
        localStorage.setItem('doidas_custom_logo', finalUrl);
      } catch {}

      setUrlInput('');
      setUploadSuccess(true);
      if (onShowToast) {
        onShowToast('Logo atualizada com sucesso via URL!');
      }
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage('Não foi possível aplicar a URL informada.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Deseja restaurar a logo para a arte oficial original das Mascotes?')) {
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      await resetLogoOnServer();
      try {
        localStorage.removeItem('doidas_custom_logo');
      } catch {}

      const cleanUrl = `/logo.jpeg?v=${Date.now()}`;
      onLogoChange(cleanUrl);

      setUploadSuccess(true);
      if (onShowToast) {
        onShowToast('Logo oficial das mascotes restaurada!');
      }
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      onLogoChange(OFFICIAL_BRAND_LOGO);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-[#1d0226] border-2 border-purple-700/60 shadow-xl space-y-5">
      {/* Header do componente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/50 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <span>Gerenciador da Logomarca Oficial</span>
          </h3>
          <p className="text-xs text-purple-200/80 mt-0.5">
            Altere a logo da loja a qualquer momento. A nova logo é gravada no servidor e atualizada imediatamente no topo, no banner e no WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          disabled={isUploading}
          className="px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/70 text-xs font-bold text-purple-200 flex items-center gap-2 transition-all self-start sm:self-auto hover:border-amber-400/60 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Restaurar Logo Original</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {uploadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Logo atualizada com sucesso e sincronizada no servidor para todos os visitantes!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Visualizador da Logo Ativa */}
        <div className="md:col-span-4 flex flex-col items-center gap-3">
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl bg-[#120119] border-2 border-amber-400/80 p-2.5 flex items-center justify-center overflow-hidden shadow-2xl group">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-amber-300">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <span className="text-[11px] font-bold text-center">Gravando no servidor...</span>
              </div>
            ) : (
              <img
                src={activeLogo}
                alt="Logo Atual"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 select-none"
                onError={(e) => {
                  if (e.currentTarget.dataset.fallback) return;
                  e.currentTarget.dataset.fallback = "true";
                  e.currentTarget.src = OFFICIAL_FALLBACK_LOGO;
                }}
              />
            )}
            <span className="absolute bottom-2 bg-black/85 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] text-amber-300 font-bold uppercase tracking-wider border border-amber-400/40">
              Logo Ativa no Site
            </span>
          </div>
          <span className="text-[11px] text-purple-300/80 text-center">
            Esta é a imagem exibida no topo, no banner e no compartilhamento social.
          </span>
        </div>

        {/* Controles de Upload & URL */}
        <div className="md:col-span-8 space-y-4">
          {/* Opção 1: Upload de Arquivo com Drag & Drop */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleProcessFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center text-center gap-2.5 ${
              dragOver
                ? 'border-amber-400 bg-purple-900/40'
                : 'border-purple-600/60 hover:border-amber-400/80 bg-[#160220] hover:bg-[#21032e]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }}
            />

            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-purple-950 shadow-md">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                {isUploading ? 'Processando e gravando logo...' : 'Clique para escolher ou arraste sua nova logo aqui'}
              </p>
              <p className="text-xs text-purple-300/80 mt-0.5">
                Aceita PNG (transparente ou fundo sólido), JPG, WebP ou SVG
              </p>
            </div>

            <button
              type="button"
              disabled={isUploading}
              className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-purple-950 font-black text-xs shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              {isUploading ? 'Gravando...' : 'Selecionar Arquivo do Computador/Celular'}
            </button>
          </div>

          {/* Opção 2: URL Direta */}
          <div className="p-3.5 rounded-xl bg-[#160220] border border-purple-700/50 space-y-2">
            <label className="block text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Ou cole a URL direta de uma imagem na internet:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://exemplo.com/minha-logo.png"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#100117] border border-purple-700/60 text-white text-xs font-mono placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={isUploading || !urlInput.trim()}
                className="px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-amber-300 font-bold text-xs border border-purple-600 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                Aplicar URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
