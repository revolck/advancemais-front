import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Clock,
  Mail,
  ExternalLink,
} from "lucide-react";

type TermsOfUseModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const sections: Array<{
  title: string;
  content: string[];
}> = [
  {
    title: "Público e Definições",
    content: [
      "Empresa: pessoa jurídica que publica vagas, contrata planos e utiliza serviços corporativos na plataforma.",
      "Candidato(a): pessoa física que cadastra currículo e se candidata a vagas de emprego.",
      "Aluno(a): pessoa física inscrita em cursos e treinamentos oferecidos na plataforma.",
      "Instrutor(a): profissional responsável por criar conteúdo, aplicar avaliações e ministrar cursos.",
      "Profissional de Psicologia/Pedagógico: presta serviços de avaliação e orientação educacional ou psicológica na plataforma.",
      "Usuário(a): qualquer pessoa que acesse ou utilize a plataforma.",
    ],
  },
  {
    title: "Elegibilidade e Cadastro",
    content: [
      "Idade mínima: recomendamos o uso para maiores de 18 anos. Menores de idade precisam de consentimento do responsável legal e devem respeitar o Estatuto da Criança e do Adolescente (ECA).",
      "Dados verdadeiros: você se compromete a fornecer informações verdadeiras, completas e atualizadas em seu cadastro.",
      "Segurança da conta: mantenha seu login e senha em sigilo. Todas as atividades realizadas na sua conta são de sua responsabilidade.",
      "Perfis e permissões: as funcionalidades disponíveis variam conforme seu perfil na plataforma (Empresa, Candidato, Aluno, Instrutor ou Profissional de Psicologia/Pedagógico).",
    ],
  },
  {
    title: "Planos, Assinaturas e Pagamentos",
    content: [
      "Planos e benefícios: algumas funcionalidades exigem contratação de planos pagos. Valores e condições são informados antes da compra.",
      "Cobrança e impostos: podem ser aplicadas taxas do meio de pagamento escolhido e impostos conforme a legislação. Comprovantes ficam disponíveis na sua conta.",
      "Renovação e cancelamento: a renovação pode ser automática quando indicado. Cancelamentos seguem nossa política comercial e o Código de Defesa do Consumidor (CDC), quando aplicável.",
      "Direito de arrependimento: contratações realizadas à distância podem ter direito de arrependimento conforme o CDC e Decreto 7.962/2013, quando aplicável.",
    ],
  },
  {
    title: "Cursos, Certificados e Comunidade",
    content: [
      "Conteúdo educacional: inclui aulas gravadas ou ao vivo, materiais complementares, avaliações e fóruns de discussão. A disponibilidade varia conforme o curso ou turma.",
      "Certificados: são emitidos quando você atende aos requisitos divulgados na página do curso, como carga horária mínima, nota mínima e presença necessária.",
      "Propriedade intelectual: todo o material é protegido por direitos autorais. É proibida a reprodução ou distribuição não autorizada.",
      "Conduta esperada: são proibidas práticas como plágio, vazamento de avaliações, assédio, tentativa de burlar acessos ou qualquer ato ilícito.",
    ],
  },
  {
    title: "Vagas e Recrutamento",
    content: [
      "Publicação de vagas: empresas devem publicar apenas vagas verdadeiras, legais e não discriminatórias.",
      "Processo seletivo: a plataforma não garante contratações, nem a idoneidade ou veracidade dos dados de terceiros. As decisões de contratação são de responsabilidade da empresa.",
      "Compartilhamento de dados: ao se candidatar a uma vaga, você autoriza o compartilhamento de seus dados com a empresa responsável pela vaga.",
      "Comunicação: a comunicação pode ocorrer pela plataforma ou por outros meios informados pela empresa. Use com respeito e proteja dados pessoais.",
    ],
  },
  {
    title: "Serviços de Psicologia e Pedagógicos",
    content: [
      "Escopo dos serviços: oferecemos serviços de avaliação e orientação prestados por profissionais cadastrados. A relação contratual é diretamente entre o profissional e você.",
      "Limitações importantes: estes serviços não substituem diagnósticos ou terapias exigidos por lei. Em caso de urgência, procure serviços de saúde adequados.",
    ],
  },
  {
    title: "Privacidade, LGPD e Cookies",
    content: [
      "Conformidade legal: tratamos seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD), Marco Civil da Internet e normas de consumo. Para mais detalhes, consulte nossa Política de Privacidade.",
      "Bases legais: utilizamos seus dados com base em execução de contrato (sua inscrição), obrigação legal (fiscal e contábil), legítimo interesse (segurança e prevenção a fraudes) e consentimento, quando necessário.",
      "Seus direitos: você pode solicitar confirmação de tratamento, acesso, correção, portabilidade, anonimização, revogação de consentimento e eliminação dos seus dados, nos termos da LGPD.",
      "Registros de acesso: mantemos registros de acesso pelo prazo mínimo exigido pelo Marco Civil da Internet.",
      "Cookies: utilizamos cookies para garantir o funcionamento da plataforma, análises e personalização. Você pode gerenciar suas preferências no banner de cookies ou nas configurações do navegador.",
      "Encarregado de Dados (DPO): para questões sobre proteção de dados, entre em contato através da Ouvidoria, FAQ ou telefones oficiais enquanto o DPO não for divulgado.",
    ],
  },
  {
    title: "Conteúdos Publicados e Moderação",
    content: [
      "Sua responsabilidade: você é responsável por todo o conteúdo que publicar na plataforma, incluindo textos, imagens, vídeos, avaliações e mensagens.",
      "Licença de uso: ao publicar conteúdo público, você concede uma licença não exclusiva e gratuita para que possamos hospedar e exibir esse conteúdo na plataforma.",
      "Remoção e suspensão: conteúdos ou contas podem ser removidos ou suspensos em caso de violação destes Termos, leis aplicáveis ou direitos de terceiros.",
    ],
  },
  {
    title: "Propriedade Intelectual",
    content: [
      "Direitos da plataforma: marcas, logotipos, layouts, software e bases de dados pertencem à empresa controladora ou são licenciados por ela.",
      "Proibições: é proibido copiar, adaptar, decompilar, fazer engenharia reversa, explorar comercialmente ou remover avisos de direitos autorais da plataforma.",
      "Denúncias: se identificar violações de propriedade intelectual, reporte através dos canais de suporte ou e-mail jurídico.",
    ],
  },
  {
    title: "Disponibilidade, Suporte e Atualizações",
    content: [
      "Disponibilidade: fazemos o possível para manter a plataforma funcionando, mas não garantimos que estará disponível 100% do tempo, sem interrupções.",
      "Suporte: oferecemos suporte através da Ouvidoria, FAQ e telefones oficiais nos horários informados.",
      "Atualizações: funcionalidades, planos e políticas podem ser alterados. Quando houver mudanças relevantes, comunicaremos através da plataforma.",
    ],
  },
  {
    title: "Uso Aceitável",
    content: [
      "É proibido: violar leis; acessar áreas ou dados de outros usuários sem autorização; interferir no funcionamento da plataforma (injeção de código, scraping abusivo, ataques DDoS); usar a plataforma para fins comerciais não autorizados; criar contas falsas; compartilhar credenciais de acesso; usar robôs ou bots não autorizados; tentar burlar sistemas de pagamento ou assinaturas.",
    ],
  },
  {
    title: "Isenções e Limitações de Responsabilidade",
    content: [
      "Conteúdos de terceiros: vagas, currículos e avaliações publicados por outros usuários são de responsabilidade de quem os publicou. Não nos responsabilizamos por essas informações.",
      "Contratação e resultados: não participamos de decisões de contratação e não garantimos resultados acadêmicos ou profissionais para usuários.",
      "Riscos da internet: reconhecemos que existem riscos inerentes ao uso da internet, como interrupções e ataques. Recomendamos que você adote medidas de segurança, como senhas fortes e uso de antivírus.",
      "Limite de responsabilidade: nossa responsabilidade está limitada ao valor pago à plataforma nos 12 meses anteriores ao evento, na extensão permitida por lei, sem prejuízo dos direitos do consumidor.",
    ],
  },
  {
    title: "Links Externos",
    content: [
      "Não nos responsabilizamos por conteúdos ou políticas de sites de terceiros. Recomendamos que você leia os termos e políticas de privacidade desses sites antes de utilizá-los.",
    ],
  },
  {
    title: "Comunicações",
    content: [
      "Você autoriza o envio de comunicações operacionais, transacionais e de marketing por e-mail, notificações push, telefone, WhatsApp, SMS ou dentro da plataforma. Você pode cancelar o recebimento de comunicações de marketing a qualquer momento.",
    ],
  },
  {
    title: "Encerramento de Conta",
    content: [
      "Você pode solicitar o encerramento da sua conta a qualquer momento. Manteremos apenas os registros mínimos exigidos por lei (como logs e registros fiscais), conforme a LGPD e o Marco Civil da Internet.",
    ],
  },
  {
    title: "E-commerce",
    content: [
      "Quando houver venda à distância, exibiremos todas as informações essenciais conforme o Código de Defesa do Consumidor (CDC) e o Decreto 7.962/2013, incluindo identificação do fornecedor, características do produto/serviço, preço total, despesas adicionais, condições de pagamento e prazo, e informações de atendimento.",
    ],
  },
  {
    title: "Alterações dos Termos",
    content: [
      "Podemos alterar estes Termos a qualquer momento. Quando houver mudanças relevantes, comunicaremos através da plataforma. O uso continuado da plataforma após a vigência das alterações indica sua concordância com os novos termos.",
    ],
  },
  {
    title: "Lei Aplicável e Foro",
    content: [
      "Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo a LGPD, Marco Civil da Internet e CDC, quando aplicáveis. Fica eleito o foro da Comarca de Maceió/AL para dirimir questões relacionadas a estes Termos, salvo disposição legal específica em contrário.",
    ],
  },
  {
    title: "Contato",
    content: [
      "Ouvidoria e FAQ: acesse as páginas dedicadas na plataforma.",
      "Telefones: (82) 3234-1397 | (82) 98882-5559",
      "Endereço: Av. Juca Sampaio, 2247 – sala 30, Condomínio Shopping Miramar, Feitosa, CEP 57.042-530, Maceió/AL.",
      "E-mail: contato@advancemais.com",
    ],
  },
];

const TermsOfUseModal = ({ isOpen, onOpenChange }: TermsOfUseModalProps) => {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper className="max-h-[90dvh] flex flex-col">
        <ModalHeader className="sticky top-0 z-10 border-b border-gray-200 pb-4 -mx-6 px-6 -mt-6 pt-6 pr-12">
          <ModalTitle className="mb-0!">Termos de Uso</ModalTitle>
          <ModalDescription>
            Vigência: 23/09/2025 · Última atualização: 23/09/2025
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="flex-1 space-y-6 overflow-y-auto pr-2 min-h-0 mt-8 p-2">
          {/* Informações da Empresa */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">
                  Controladora/Operadora:
                </strong>{" "}
                ADVANCE+ CURSOS E TREINAMENTOS LTDA – ME
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">CNPJ:</strong>{" "}
                25.089.257/0001-92
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">Endereço:</strong> Av. Juca
                Sampaio, 2247 – sala 30, Condomínio Shopping Miramar, Feitosa,
                CEP 57.042-530, Maceió/AL
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">Telefones:</strong> (82)
                3234-1397 | (82) 98882-5559
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">
                  Horário de atendimento:
                </strong>{" "}
                seg–sex 08h–20h, sáb 09h–13h
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">E-mail:</strong>{" "}
                <a
                  href="mailto:contato@advancemais.com"
                  className="!text-primary hover:underline"
                >
                  contato@advancemais.com
                </a>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">Ouvidoria/FAQ:</strong>{" "}
                <a
                  href="https://advancemais.com/ouvidoria"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="!text-primary underline-offset-4 hover:underline"
                >
                  advancemais.com/ouvidoria
                </a>
                {" · "}
                <a
                  href="https://advancemais.com/faq"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="!text-primary underline-offset-4 hover:underline"
                >
                  advancemais.com/faq
                </a>
              </p>
            </div>
          </div>
          <p>
            Ao acessar ou usar a Plataforma, você concorda com estes Termos e
            com a nossa Política de Privacidade (LGPD). Se não concordar, não
            utilize a Plataforma. Poderemos atualizar este documento; a versão
            vigente estará sempre nesta página.
          </p>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <section key={section.title} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <h2 className="!font-semibold !text-base !text-foreground !mb-0">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-2">
                  {section.content.map((paragraph, contentIndex) => (
                    <p
                      key={`${section.title}-${contentIndex}`}
                      className="!leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="space-y-2 pt-4 border-t border-gray-200">
            <h2 className="!font-semibold !text-base !text-foreground">
              Aviso Legal
            </h2>
            <p className="!leading-relaxed">
              Este documento reflete legislação brasileira vigente e boas
              práticas, mas não substitui assessoria jurídica. Recomenda-se
              revisão por advogado(a) para adequação às particularidades do seu
              negócio.
            </p>
          </section>
        </ModalBody>

        <ModalFooter className="sticky bottom-0 z-10 border-t border-gray-200 pt-4 -mx-6 px-6">
          <div className="flex items-center justify-end gap-3 w-full">
            <ButtonCustom
              type="button"
              variant="outline"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </ButtonCustom>
            <ButtonCustom
              type="button"
              variant="primary"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Entendi
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
};

export default TermsOfUseModal;
