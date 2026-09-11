import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600">
            AgendaApp
          </Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">
            Voltar para o início
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-500 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Aceitação dos Termos</h2>
            <p>
              Estes Termos de Uso regulam o acesso e a utilização da plataforma <strong>AgendaApp</strong>,
              disponibilizada por <strong>[NOME DA EMPRESA]</strong>, inscrita no CNPJ sob o nº
              <strong> [CNPJ]</strong>, com sede em <strong>[ENDEREÇO COMPLETO]</strong> ("nós" ou "Plataforma").
              Ao criar uma conta, contratar um plano ou utilizar qualquer funcionalidade, você
              ("Usuário") declara ter lido, compreendido e aceito integralmente estes Termos, bem como
              a nossa Política de Privacidade.
            </p>
            <p className="mt-2">
              Caso não concorde com qualquer disposição, o Usuário não deverá utilizar a Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Descrição do Serviço</h2>
            <p>
              O AgendaApp é uma plataforma de software como serviço (SaaS) que permite a
              profissionais e estabelecimentos de beleza e estética gerenciarem sua agenda,
              profissionais, serviços e agendamentos, além de disponibilizar uma página pública
              de agendamento acessível por subdomínio próprio, sem necessidade de cadastro pelos
              clientes finais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Cadastro e Conta</h2>
            <p>
              3.1. Para utilizar a Plataforma, o Usuário deverá criar uma conta fornecendo informações
              verdadeiras, completas e atualizadas.
            </p>
            <p className="mt-2">
              3.2. O Usuário é o único responsável pela veracidade das informações fornecidas, bem como
              pela guarda e sigilo de suas credenciais de acesso.
            </p>
            <p className="mt-2">
              3.3. É vedado o compartilhamento da conta com terceiros. Toda atividade realizada com as
              credenciais do Usuário será considerada de sua responsabilidade.
            </p>
            <p className="mt-2">
              3.4. O Usuário deve ter no mínimo 18 anos e capacidade civil plena para contratar os serviços.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Planos, Pagamentos e Cancelamento</h2>
            <p>
              4.1. A Plataforma oferece planos de assinatura cujos valores, recursos e formas de pagamento
              estão descritos na página de planos.
            </p>
            <p className="mt-2">
              4.2. Os pagamentos são processados por terceiros (gateways de pagamento). Ao contratar, o
              Usuário concorda com os termos do respectivo provedor.
            </p>
            <p className="mt-2">
              4.3. O período de teste, quando oferecido, permite o uso gratuito por prazo determinado. Após
              esse prazo, o plano escolhido será cobrado automaticamente.
            </p>
            <p className="mt-2">
              4.4. O Usuário pode cancelar a assinatura a qualquer momento. O acesso permanece ativo até o
              fim do período já pago.
            </p>
            <p className="mt-2">
              4.5. Não haverá reembolso proporcional por cancelamento antecipado, salvo disposição legal em
              contrário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Obrigações do Usuário</h2>
            <p>O Usuário se compromete a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Utilizar a Plataforma em conformidade com a legislação vigente.</li>
              <li>Não utilizar o serviço para fins ilícitos, fraudulentos ou que violem direitos de terceiros.</li>
              <li>Não inserir conteúdo ofensivo, ilegal, discriminatório ou que infrinja direitos autorais.</li>
              <li>Obter as devidas autorizações dos clientes finais ao coletar e inserir seus dados na Plataforma.</li>
              <li>Manter seus dados cadastrais atualizados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Proteção de Dados Pessoais</h2>
            <p>
              6.1. O tratamento de dados pessoais realizado na Plataforma é regido pela nossa
              <Link to="/privacidade" className="text-blue-600 hover:underline"> Política de Privacidade</Link>,
              elaborada em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).
            </p>
            <p className="mt-2">
              6.2. Em relação aos dados dos clientes finais cadastrados pelo Usuário na Plataforma, o
              Usuário atua na condição de <strong>Controlador</strong> e o AgendaApp na condição de
              <strong> Operador</strong>, nos termos do art. 5º da LGPD.
            </p>
            <p className="mt-2">
              6.3. O Usuário se compromete a manter base legal adequada para o tratamento dos dados
              pessoais de seus clientes finais, bem como a fornecer a eles as informações exigidas pela LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Propriedade Intelectual</h2>
            <p>
              7.1. Todo o conteúdo, código-fonte, marca, layout e funcionalidades da Plataforma são de
              propriedade exclusiva de <strong>[NOME DA EMPRESA]</strong>, sendo vedada a reprodução,
              distribuição ou uso não autorizado.
            </p>
            <p className="mt-2">
              7.2. Os dados inseridos pelo Usuário (informações do estabelecimento, profissionais, serviços
              e clientes) permanecem de propriedade do Usuário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Disponibilidade e Suporte</h2>
            <p>
              8.1. Nos esforçamos para manter a Plataforma disponível continuamente, mas não garantimos
              operação ininterrupta e livre de erros. Podem ocorrer manutenções programadas ou
              indisponibilidades temporárias.
            </p>
            <p className="mt-2">
              8.2. O suporte é oferecido conforme o plano contratado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Limitação de Responsabilidade</h2>
            <p>
              9.1. A Plataforma é fornecida "como está". Não nos responsabilizamos por lucros cessantes,
              perda de dados decorrente de uso indevido, ou danos indiretos.
            </p>
            <p className="mt-2">
              9.2. Não nos responsabilizamos pela relação comercial entre o Usuário e seus clientes finais,
              incluindo comparecimento, cancelamento, qualidade do serviço prestado ou inadimplência.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Suspensão e Encerramento</h2>
            <p>
              10.1. Podemos suspender ou encerrar contas que violem estes Termos, a legislação vigente ou
              que apresentem risco à segurança da Plataforma.
            </p>
            <p className="mt-2">
              10.2. O Usuário pode solicitar o encerramento da conta a qualquer momento pelos canais
              de atendimento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">11. Alterações dos Termos</h2>
            <p>
              Podemos atualizar estes Termos periodicamente. Alterações relevantes serão comunicadas com
              antecedência razoável. O uso contínuo da Plataforma após a atualização implica concordância
              com os novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">12. Legislação Aplicável e Foro</h2>
            <p>
              Estes Termos são regidos pelas leis brasileiras. Eventuais controvérsias serão resolvidas
              no foro da comarca de <strong>[COMARCA]</strong>, salvo disposição legal aplicável ao consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">13. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos, entre em contato pelo e-mail
              <strong> [E-MAIL DE CONTATO]</strong>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}