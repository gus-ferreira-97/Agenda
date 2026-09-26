import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <>
      <SEO
        title="Política de Privacidade - Agendy"
        description="Como o Agendy trata seus dados pessoais, em conformidade com a LGPD."
      />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
            <Link to="/" className="text-lg md:text-xl font-bold text-blue-600 flex-shrink-0">
              Agendy
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs md:text-sm text-gray-600 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </Link>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 text-gray-800">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Política de Privacidade</h1>
          <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-6 md:space-y-8 text-sm md:text-[15px] leading-relaxed">
            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">1. Quem somos</h2>
              <p>
                Esta Política de Privacidade descreve como <strong>[NOME DA EMPRESA]</strong>,
                inscrita no CNPJ sob o nº <strong>[CNPJ]</strong>, com sede em
                <strong> [ENDEREÇO COMPLETO]</strong>, realiza o tratamento de dados pessoais
                na plataforma <strong>Agendy</strong>, em conformidade com a Lei Geral de
                Proteção de Dados (Lei nº 13.709/2018 – LGPD).
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">2. Definições</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Titular:</strong> pessoa natural a quem se referem os dados pessoais.</li>
                <li><strong>Controlador:</strong> quem decide sobre o tratamento dos dados pessoais.</li>
                <li><strong>Operador:</strong> quem realiza o tratamento em nome do Controlador.</li>
                <li><strong>Encarregado (DPO):</strong> pessoa indicada para atuar como canal de comunicação entre o Controlador, os Titulares e a ANPD.</li>
                <li><strong>ANPD:</strong> Autoridade Nacional de Proteção de Dados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">3. Quais dados coletamos</h2>
              <p><strong>3.1. Dados do Usuário (responsável pelo estabelecimento):</strong></p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Nome completo, e-mail, senha (armazenada em formato criptografado) e telefone.</li>
                <li>Dados do estabelecimento: nome, subdomínio, endereço, serviços, profissionais e horários.</li>
                <li>Dados de pagamento processados exclusivamente pelo gateway de pagamento (não armazenamos dados de cartão).</li>
                <li>Dados de acesso: endereço IP, data/hora, navegador e dispositivo.</li>
              </ul>

              <p className="mt-3"><strong>3.2. Dados dos Clientes Finais (inseridos pelo Usuário):</strong></p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Nome e contato (telefone e/ou e-mail).</li>
                <li>Histórico de agendamentos (serviço, profissional, data e hora).</li>
              </ul>

              <p className="mt-3"><strong>3.3. Cookies e tecnologias similares:</strong></p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Cookies essenciais para autenticação e funcionamento da plataforma.</li>
                <li>Cookies analíticos (mediante consentimento) para melhorar a experiência.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">4. Finalidades e bases legais</h2>
              <p>
                O tratamento de dados pessoais é realizado com base nas hipóteses legais previstas no
                art. 7º da LGPD:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Execução de contrato:</strong> para fornecer a plataforma de agendamento contratada.</li>
                <li><strong>Cumprimento de obrigação legal ou regulatória:</strong> quando exigido por lei (ex.: fiscais).</li>
                <li><strong>Legítimo interesse:</strong> para segurança, prevenção a fraudes e melhoria dos serviços.</li>
                <li><strong>Consentimento:</strong> para comunicações de marketing e cookies não essenciais.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">5. Papéis: Controlador e Operador</h2>
              <p>
                5.1. Em relação aos dados do Usuário (responsável pelo estabelecimento), o Agendy
                atua como <strong>Controlador</strong>.
              </p>
              <p className="mt-2">
                5.2. Em relação aos dados dos Clientes Finais inseridos pelo Usuário, o Usuário atua
                como <strong>Controlador</strong> e o Agendy atua como <strong>Operador</strong>. Nesse caso:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>O Usuário é responsável por obter base legal adequada para o tratamento.</li>
                <li>O Usuário deve informar seus clientes finais sobre a coleta e uso dos dados.</li>
                <li>O Agendy tratará tais dados apenas conforme instruções do Usuário.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">6. Compartilhamento de dados</h2>
              <p>
                Podemos compartilhar dados pessoais com terceiros estritamente necessários à prestação
                do serviço, na qualidade de operadores/subprocessadores:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provedores de infraestrutura em nuvem (hospedagem do banco de dados e aplicação).</li>
                <li>Gateways de pagamento (para processar assinaturas).</li>
                <li>Serviços de envio de e-mail transacional.</li>
                <li>Ferramentas de análise e monitoramento (mediante consentimento quando aplicável).</li>
              </ul>
              <p className="mt-2">
                Todos os terceiros são contratualmente obrigados a manter a confidencialidade e a
                conformidade com a LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">7. Transferência internacional de dados</h2>
              <p>
                Caso ocorra transferência internacional de dados, ela será realizada apenas para
                países que ofereçam grau de proteção adequado ou mediante garantias contratuais
                específicas, conforme arts. 33 a 36 da LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">8. Retenção de dados</h2>
              <p>
                Os dados são armazenados apenas pelo tempo necessário ao cumprimento das finalidades
                para as quais foram coletados, observados os prazos legais de retenção:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Dados da conta: enquanto a conta estiver ativa ou pelo prazo legal aplicável.</li>
                <li>Dados de agendamento: por até <strong>[PRAZO, ex.: 5 anos]</strong> após o último uso, salvo obrigação legal diversa.</li>
                <li>Registros de acesso: pelo prazo mínimo de 6 meses, conforme o art. 15 do Marco Civil da Internet.</li>
                <li>Dados fiscais: pelo prazo exigido pela legislação tributária.</li>
              </ul>
              <p className="mt-2">
                Após o prazo, os dados são anonimizados ou eliminados de forma segura.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">9. Direitos do Titular</h2>
              <p>
                Nos termos do art. 18 da LGPD, o Titular pode, a qualquer momento, solicitar:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Confirmação da existência de tratamento.</li>
                <li>Acesso aos dados.</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
                <li>Portabilidade dos dados a outro fornecedor.</li>
                <li>Eliminação dos dados tratados com base no consentimento.</li>
                <li>Informação sobre entidades com as quais compartilhamos dados.</li>
                <li>Informação sobre a possibilidade de não fornecer consentimento e as consequências.</li>
                <li>Revogação do consentimento.</li>
                <li>Oposição a tratamentos realizados sem consentimento, quando houver descumprimento da LGPD.</li>
              </ul>
              <p className="mt-2">
                As solicitações podem ser feitas pelo e-mail <strong>[E-MAIL DO ENCARREGADO]</strong>.
                Responderemos em até 15 dias, salvo prazo diverso previsto em regulamentação da ANPD.
              </p>

              <p className="mt-3 font-medium text-gray-900">
                Exclusão de conta (self-service)
              </p>
              <p className="mt-1">
                Se você possui uma conta de acesso à plataforma (administrador de estabelecimento),
                pode solicitar a exclusão imediata dos seus dados pessoais diretamente pelo painel,
                sem precisar enviar e-mail:
              </p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Acesse <strong>Meu Perfil</strong> no painel.</li>
                <li>Role até a seção <strong>"Zona de perigo"</strong>.</li>
                <li>Clique em <strong>"Excluir minha conta"</strong>.</li>
                <li>Digite <strong>EXCLUIR</strong> no campo de confirmação e finalize.</li>
              </ol>
              <p className="mt-2 text-sm text-gray-600">
                Após a confirmação, seus dados pessoais (nome, e-mail, senha) serão anonimizados
                imediatamente. Registros de auditoria são mantidos por 365 dias por obrigação legal
                (art. 16 da LGPD e art. 15 do Marco Civil da Internet). Esta ação é irreversível.
              </p>

              <p className="mt-2">
                Se o Titular for cliente final de um estabelecimento cadastrado na plataforma, recomendamos
                que entre em contato diretamente com o estabelecimento, que atua como Controlador.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">10. Segurança dos dados</h2>
              <p>
                Adotamos medidas técnicas e administrativas para proteger os dados pessoais, incluindo:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Criptografia de senhas com algoritmo bcrypt.</li>
                <li>Comunicação via HTTPS/TLS.</li>
                <li>Autenticação por token JWT.</li>
                <li>Isolamento lógico de dados por tenant (multi-tenancy).</li>
                <li>Controle de acesso por papéis (RBAC).</li>
                <li>Backups periódicos e monitoramento de segurança.</li>
              </ul>
              <p className="mt-2">
                Nenhum sistema é 100% imune a incidentes. Em caso de incidente de segurança relevante,
                comunicaremos os Titulares e a ANPD conforme o art. 48 da LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">11. Cookies</h2>
              <p>
                Utilizamos cookies essenciais para o funcionamento da plataforma (como autenticação) e,
                mediante consentimento, cookies analíticos para entender como os usuários utilizam o
                serviço. O usuário pode gerenciar cookies nas configurações do navegador.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">12. Encarregado de Dados (DPO)</h2>
              <p>
                Nosso Encarregado de Proteção de Dados (DPO) pode ser contatado pelo e-mail
                <strong> [E-MAIL DO ENCARREGADO]</strong> para assuntos relacionados à LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">13. Alterações desta Política</h2>
              <p>
                Esta Política pode ser atualizada periodicamente. Recomendamos revisão regular. Alterações
                relevantes serão comunicadas na plataforma ou por e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">14. Autoridade Nacional de Proteção de Dados</h2>
              <p>
                Caso o Titular entenda que suas solicitações não foram atendidas adequadamente, poderá
                apresentar reclamação à ANPD, por meio do site oficial
                <a
                  href="https://www.gov.br/anpd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {' '}www.gov.br/anpd
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900">15. Contato</h2>
              <p>
                Dúvidas sobre esta Política podem ser enviadas para <strong>[E-MAIL DE CONTATO]</strong>.
              </p>
            </section>
          </div>

          {/* Footer da página */}
          <div className="mt-10 md:mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/termos"
              className="text-xs md:text-sm text-blue-600 hover:underline"
            >
              Ver Termos de Uso →
            </Link>
            <Link
              to="/"
              className="text-xs md:text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para o início
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}