"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header com botão de voltar */}
      <div className="bg-gradient-to-r from-esmerald-600 to-esmerald-800 text-white py-6">
        <div className="container mx-auto px-4">
          <Link 
            href="/portal-lgpd" 
            className="inline-flex items-center gap-2 text-esmerald-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Portal LGPD
          </Link>
          <h1 className="text-3xl font-bold">Política de Privacidade e Proteção de Dados</h1>
          <p className="text-esmerald-100 mt-2">Última atualização: 07 de novembro de 2025</p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          
          <div className="bg-esmerald-50 border-l-4 border-esmerald-500 p-6 mb-8">
            <p className="text-gray-800 leading-relaxed">
              O site <strong>IPC Passos</strong> é responsável por promover e gerenciar inscrições para acampamentos e eventos da Igreja Presbiteriana Central de Passos.
              Prezamos pela segurança e privacidade dos dados pessoais de nossos participantes, incluindo menores de idade.
              Esta Política explica como coletamos, usamos e protegemos suas informações, conforme a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD)</strong>.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">1. Dados pessoais coletados</h2>
            <p className="text-gray-700 mb-4">Podemos coletar as seguintes informações durante o processo de inscrição e participação:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Nome completo do participante e do responsável legal</li>
              <li>Data de nascimento</li>
              <li>Sexo</li>
              <li>CPF ou RG</li>
              <li>Endereço completo</li>
              <li>E-mail e telefone de contato</li>
              <li>Contato de emergência</li>
              <li>Informações médicas relevantes (alergias, restrições alimentares, medicamentos de uso contínuo)</li>
              <li>Dados de pagamento e comprovantes de inscrição</li>
              <li>Fotos ou vídeos tirados durante o evento</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800">
                <strong>Importante:</strong> Quando o titular for menor de 18 anos, os dados somente serão tratados com o consentimento expresso dos pais ou responsáveis legais.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">2. Finalidade do tratamento de dados</h2>
            <p className="text-gray-700 mb-4">Os dados são utilizados para as seguintes finalidades:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Gerenciamento de inscrições e pagamentos</li>
              <li>Comunicação com responsáveis e participantes</li>
              <li>Organização logística dos acampamentos e eventos</li>
              <li>Atendimento médico e emergencial durante o evento</li>
              <li>Envio de informações e avisos relacionados às atividades</li>
              <li>Divulgação de fotos e vídeos em redes sociais e materiais institucionais (com consentimento)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">3. Base legal</h2>
            <p className="text-gray-700 mb-4">O tratamento de dados realizado pelo IPC Passos é fundamentado nas seguintes bases legais:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Execução de contrato ou procedimentos preliminares de inscrição</li>
              <li>Consentimento do titular ou responsável legal</li>
              <li>Proteção da vida e da incolumidade física do titular ou de terceiros</li>
              <li>Cumprimento de obrigação legal ou regulatória</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">4. Compartilhamento de dados</h2>
            <p className="text-gray-700 mb-4">Os dados poderão ser compartilhados com:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Serviços de hospedagem e infraestrutura (Vercel, Firebase, Google Cloud)</li>
              <li>Ferramentas de análise (Google Analytics)</li>
              <li>Plataformas de comunicação (WhatsApp, Instagram, Facebook)</li>
              <li>Serviços de pagamento, contabilidade ou bancos conveniados</li>
              <li>Profissionais de saúde em caso de emergência</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">5. Armazenamento e segurança</h2>
            <p className="text-gray-700">
              Os dados são armazenados de forma segura em servidores localizados no Brasil e no exterior,
              com medidas técnicas e administrativas para proteger contra acesso não autorizado, perda ou vazamento de informações.
              O IPC Passos utiliza provedores reconhecidos, como <strong>Firebase, Google e Vercel</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">6. Tempo de retenção</h2>
            <p className="text-gray-700">
              Os dados serão mantidos apenas pelo tempo necessário para cumprir as finalidades descritas ou conforme exigência legal.
              Após esse período, serão eliminados ou anonimizados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">7. Direitos do titular</h2>
            <p className="text-gray-700 mb-4">O titular dos dados (ou seu responsável legal) tem direito a:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Solicitar confirmação da existência de tratamento</li>
              <li>Solicitar acesso, correção ou exclusão dos dados</li>
              <li>Solicitar portabilidade ou anonimização</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">8. Encarregado de Dados (DPO)</h2>
            <p className="text-gray-700 mb-4">
              Em caso de dúvidas ou solicitações sobre esta Política ou o tratamento de dados, entre em contato:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ul className="space-y-2 text-gray-700">
                <li><strong>Nome:</strong> Encarregado de Dados – IPC Passos</li>
                <li><strong>E-mail:</strong> <a href="mailto:ipbcpassos@gmail.com" className="text-esmerald-600 hover:text-esmerald-800 underline">ipbcpassos@gmail.com</a></li>
              </ul>
            </div>
          </section>

          <section id="cookies" className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">9. Uso de Cookies</h2>
            <p className="text-gray-700 mb-4">
              Nosso site utiliza cookies para melhorar sua experiência de navegação, analisar o tráfego e integrar ferramentas como o <strong>Google Analytics</strong>.
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo.
            </p>

            <p className="text-gray-700 mb-4">Os tipos de cookies que utilizamos incluem:</p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">Essenciais</h4>
                <p className="text-blue-700 text-sm">Necessários para o funcionamento do site</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-2">Analíticos</h4>
                <p className="text-green-700 text-sm">Usados para entender o comportamento dos usuários</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-800 mb-2">Marketing</h4>
                <p className="text-purple-700 text-sm">Para exibir conteúdo relevante nas redes sociais</p>
              </div>
            </div>

            <p className="text-gray-700">
              Você pode controlar ou desativar cookies nas configurações do seu navegador a qualquer momento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-esmerald-800 mb-4">10. Atualizações desta Política</h2>
            <p className="text-gray-700">
              Esta Política poderá ser atualizada periodicamente para refletir mudanças em nossas práticas ou exigências legais.
              Recomendamos que você a consulte regularmente.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />
          
          <div className="text-center text-gray-500 text-sm">
            <p><em>© 2025 IPC Passos — Todos os direitos reservados.</em></p>
          </div>

        </div>
      </div>
    </div>
  )
}