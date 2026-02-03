
-- 1. ESTRUTURA DA TABELA DE QUESTÕES
CREATE TABLE IF NOT EXISTS public.questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    text text NOT NULL,
    verse_reference text,
    scheduled_for date UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read questions" ON public.questions;
CREATE POLICY "Public can read questions" ON public.questions FOR SELECT USING (true);

-- 2. INSERÇÃO DAS PERGUNTAS AGENDADAS (Seed)
-- Este bloco limpa agendamentos futuros para evitar conflitos de data e insere a nova lista
DELETE FROM public.questions WHERE scheduled_for >= CURRENT_DATE;

INSERT INTO public.questions (text, verse_reference, scheduled_for) VALUES
('O que você anda fingindo que não sente?', 'Salmos 139:23', CURRENT_DATE),
('Em que parte da sua vida você mais finge estar bem?', 'Jeremias 17:9', CURRENT_DATE + interval '1 day'),
('O que você tem evitado encarar em si mesmo?', '2 Coríntios 13:5', CURRENT_DATE + interval '2 days'),
('Qual verdade sobre você te dá mais medo de admitir?', 'João 8:32', CURRENT_DATE + interval '3 days'),
('O que você anda carregando que nunca contou a ninguém?', 'Salmos 38:4', CURRENT_DATE + interval '4 days'),
('Qual parte da sua vida você evita levar para a oração?', 'Salmos 66:18', CURRENT_DATE + interval '5 days'),
('O que você faz para parecer forte quando está cansado?', '2 Coríntios 12:9', CURRENT_DATE + interval '6 days'),
('Que dor você chama de maturidade para não lidar com ela?', 'Salmos 147:3', CURRENT_DATE + interval '7 days'),
('O que você anda tolerando só para não ficar sozinho?', 'Provérbios 13:20', CURRENT_DATE + interval '8 days'),
('Quem você seria se parasse de tentar agradar todo mundo?', 'Gálatas 1:10', CURRENT_DATE + interval '9 days'),
('O que você tem medo de perder se mudar de verdade?', 'Marcos 8:35', CURRENT_DATE + interval '10 days'),
('Que parte da sua fé virou só costume?', 'Isaías 29:13', CURRENT_DATE + interval '11 days'),
('O que você pede a Deus em silêncio, mas evita em voz alta?', 'Salmos 62:8', CURRENT_DATE + interval '12 days'),
('Que perdão você vive adiando?', 'Efésios 4:32', CURRENT_DATE + interval '13 days'),
('O que você anda confundindo com paciência, mas é medo?', 'Eclesiastes 7:8', CURRENT_DATE + interval '14 days'),
('O que você evita porque exige coragem?', 'Josué 1:9', CURRENT_DATE + interval '15 days'),
('Qual mentira confortável você ainda escolhe acreditar?', 'João 8:44', CURRENT_DATE + interval '16 days'),
('O que você tenta controlar porque não confia?', 'Provérbios 3:5', CURRENT_DATE + interval '17 days'),
('Que silêncio dentro de você está gritando?', 'Habacuque 2:20', CURRENT_DATE + interval '18 days'),
('O que você chama de fé, mas é só hábito?', 'Tiago 1:22', CURRENT_DATE + interval '19 days'),
('Quem você seria sem a necessidade de parecer bem?', 'Salmos 51:6', CURRENT_DATE + interval '20 days'),
('O que você anda ignorando que já passou do limite?', 'Provérbios 4:23', CURRENT_DATE + interval '21 days'),
('Que parte da sua história você tenta esconder?', 'Salmos 32:5', CURRENT_DATE + interval '22 days'),
('O que você faz no automático para não pensar?', 'Salmos 119:59', CURRENT_DATE + interval '23 days'),
('Qual dor você normalizou para continuar funcionando?', 'Mateus 11:28', CURRENT_DATE + interval '24 days'),
('O que você teme ouvir se realmente escutar Deus?', '1 Samuel 3:10', CURRENT_DATE + interval '25 days'),
('O que você evita levar para a luz?', 'Efésios 5:13', CURRENT_DATE + interval '26 days'),
('Quem você é quando ninguém está olhando?', 'Provérbios 29:25', CURRENT_DATE + interval '27 days'),
('O que você anda chamando de força, mas é resistência a mudar?', 'Hebreus 3:15', CURRENT_DATE + interval '28 days'),
('Que verdade você sabe, mas não vive?', 'Tiago 1:22', CURRENT_DATE + interval '29 days'),
('O que você anda sustentando que já te esgotou?', 'Isaías 40:29', CURRENT_DATE + interval '30 days'),
('O que você tenta justificar em vez de transformar?', 'Romanos 12:2', CURRENT_DATE + interval '31 days'),
('Que dor você ainda trata como identidade?', 'Isaías 43:18', CURRENT_DATE + interval '32 days'),
('O que você perde ao insistir em estar certo?', 'Provérbios 16:18', CURRENT_DATE + interval '33 days'),
('O que você anda empurrando com a barriga por medo?', 'Lucas 9:23', CURRENT_DATE + interval '34 days'),
('Quem você tenta impressionar mais do que deveria?', 'Provérbios 27:2', CURRENT_DATE + interval '35 days'),
('O que você anda evitando pedir ajuda?', 'Eclesiastes 4:9-10', CURRENT_DATE + interval '36 days'),
('O que você precisa soltar para continuar inteiro?', 'Hebreus 12:1', CURRENT_DATE + interval '37 days'),
('O que você chama de zelo, mas é controle?', 'Colossenses 3:2', CURRENT_DATE + interval '38 days'),
('O que você anda escondendo até de si mesmo?', 'Salmos 19:12', CURRENT_DATE + interval '39 days'),
('O que em você pede descanso e você ignora?', 'Salmos 23:2', CURRENT_DATE + interval '40 days'),
('Que parte da sua vida precisa de verdade, não discurso?', 'João 4:24', CURRENT_DATE + interval '41 days'),
('O que você anda chamando de vontade de Deus para não decidir?', 'Provérbios 16:9', CURRENT_DATE + interval '42 days'),
('O que você faria se realmente confiasse em Deus?', 'Provérbios 16:3', CURRENT_DATE + interval '43 days'),
('O que você teme perder se for honesto?', 'Lucas 14:33', CURRENT_DATE + interval '44 days'),
('O que você anda alimentando que está te adoecendo?', 'Provérbios 4:23', CURRENT_DATE + interval '45 days'),
('O que você vive adiando porque exige mudança real?', '2 Coríntios 5:17', CURRENT_DATE + interval '46 days'),
('O que você chama de paciência, mas é conformismo?', 'Apocalipse 3:15', CURRENT_DATE + interval '47 days'),
('Quem você seria se parasse de fugir?', 'Jonas 1:3', CURRENT_DATE + interval '48 days'),
('O que você anda evitando porque dói crescer?', 'Hebreus 12:11', CURRENT_DATE + interval '49 days'),
('O que você precisa enfrentar para amadurecer?', 'Tiago 1:4', CURRENT_DATE + interval '50 days'),
('O que você anda chamando de fé, mas é medo?', '2 Timóteo 1:7', CURRENT_DATE + interval '51 days'),
('Que verdade você evita porque quebra sua narrativa?', 'João 5:6', CURRENT_DATE + interval '52 days'),
('O que você anda tolerando que já virou prisão?', 'Gálatas 5:1', CURRENT_DATE + interval '53 days'),
('O que você precisa confessar para ser livre?', '1 João 1:9', CURRENT_DATE + interval '54 days'),
('O que você tenta salvar que Deus já pediu pra soltar?', 'Gênesis 22:2', CURRENT_DATE + interval '55 days'),
('O que você anda adiando por falta de coragem?', 'Josué 1:7', CURRENT_DATE + interval '56 days'),
('Quem você seria se não tivesse que provar nada?', 'Salmos 46:10', CURRENT_DATE + interval '57 days'),
('O que você faz para não lidar com o vazio?', 'Eclesiastes 1:14', CURRENT_DATE + interval '58 days'),
('O que você precisa desaprender?', 'Romanos 12:2', CURRENT_DATE + interval '59 days'),
('O que você anda evitando porque exige humildade?', 'Miquéias 6:8', CURRENT_DATE + interval '60 days'),
('O que você teme perder ao mudar?', 'Marcos 10:21', CURRENT_DATE + interval '61 days'),
('O que você ainda não entregou de verdade?', 'Provérbios 3:6', CURRENT_DATE + interval '62 days'),
('O que você anda sustentando por orgulho?', 'Provérbios 11:2', CURRENT_DATE + interval '63 days'),
('O que você precisa parar de fingir?', 'Salmos 139:24', CURRENT_DATE + interval '64 days'),
('O que você faria se não tivesse medo do julgamento?', 'João 12:43', CURRENT_DATE + interval '65 days'),
('O que você anda chamando de normal, mas não é?', 'Romanos 12:2', CURRENT_DATE + interval '66 days'),
('O que você precisa ouvir, mas evita?', 'Provérbios 1:23', CURRENT_DATE + interval '67 days'),
('O que você anda resistindo que pode te curar?', 'Jeremias 17:14', CURRENT_DATE + interval '68 days');

-- 3. LIMPEZA E POLÍTICAS DE RESPONSES
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'responses' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY %I ON public.responses', pol.policyname);
    END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.check_if_answered(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.check_if_answered(q_id uuid, u_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.responses 
        WHERE question_id = q_id AND user_id = u_id
    );
END;
$$;

ALTER FUNCTION public.check_if_answered(uuid, uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.check_if_answered(uuid, uuid) TO anon, authenticated;

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "responses_insert" ON public.responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "responses_select" ON public.responses FOR SELECT USING (
    (auth.uid() = user_id) 
    OR 
    (public.check_if_answered(question_id, auth.uid()))
);

-- 4. REAÇÕES
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reactions_select" ON public.reactions;
DROP POLICY IF EXISTS "reactions_insert" ON public.reactions;
CREATE POLICY "reactions_select" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
