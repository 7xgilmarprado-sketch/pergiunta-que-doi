
import React, { useState, useEffect, useCallback } from 'react';
import { View, Question, Response, UserProfile, UserDisplayMode } from './types';
import { ICONS } from './constants';
import { Navigation } from './components/Navigation';
import { supabase } from './services/supabaseClient';
import { db } from './services/db';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myAnswer, setMyAnswer] = useState('');
  
  const [displayMode, setDisplayMode] = useState<UserDisplayMode>('anonymous');
  const [userName, setUserName] = useState('');
  const [userPseudonym, setUserPseudonym] = useState('');

  const [collectiveResponses, setCollectiveResponses] = useState<Response[]>([]);
  const [myHistory, setMyHistory] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const initApp = async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      // 1. Autenticação com Fallback
      const { data: authData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) console.warn("Erro ao recuperar sessão:", sessionError);

      let currentUser = authData.session?.user;

      if (!currentUser) {
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) {
          const isEnabled = !signInError.message.toLowerCase().includes("disabled");
          setAuthError(isEnabled ? signInError.message : "AUTH_DISABLED");
          setLoading(false);
          return;
        }
        currentUser = signInData.user;
      }

      setUser(currentUser);
      
      // 2. Carregar Pergunta com Fallback Seguro
      let question;
      try {
        question = await db.getTodayQuestion();
      } catch (e) {
        console.error("Falha fatal ao buscar pergunta:", e);
        question = {
          id: 'fallback-00',
          text: 'O que você anda fingindo que não sente?',
          date: new Date().toLocaleDateString('en-CA'),
          verseReference: 'Salmos 139:23'
        };
      }
      setCurrentQuestion(question);

      // 3. Carregar Histórico
      if (currentUser && question) {
        const history = await db.getUserHistory(currentUser.id);
        setMyHistory(history);
        const todayAnswer = history.find(r => r.questionId === question.id);
        
        if (todayAnswer) {
          setHasAnswered(true);
          setMyAnswer(todayAnswer.content);
          try {
            const collective = await db.getResponses(question.id);
            setCollectiveResponses(collective);
          } catch (e) {
            console.warn("Mural ainda não disponível via RLS.");
          }
        }
      }
    } catch (err) {
      console.error("Erro crítico na inicialização do App:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const handleSendResponse = async () => {
    if (!currentQuestion || !user || myAnswer.trim().length < 5) return;
    
    setLoading(true);
    try {
      await db.saveResponse({
        questionId: currentQuestion.id,
        userId: user.id,
        content: myAnswer,
        displayMode: displayMode,
        userName: displayMode === 'real_name' ? userName : undefined,
        userPseudonym: displayMode === 'pseudonym' ? userPseudonym : undefined
      });

      setHasAnswered(true);
      const history = await db.getUserHistory(user.id);
      setMyHistory(history);
      
      setTimeout(async () => {
        try {
          const collective = await db.getResponses(currentQuestion.id);
          setCollectiveResponses(collective);
        } catch (e) {
          console.warn("Aguardando estabilização do mural...");
        }
      }, 800);
      
      setCurrentView('collective');
    } catch (err: any) {
      if (err.message === 'ALREADY_ANSWERED') {
        setHasAnswered(true);
        setCurrentView('collective');
      } else {
        console.error("Erro ao salvar:", err);
        if (err.message?.includes('recursion') || err.code === '42P17') {
           alert("Sua resposta foi enviada, mas o mural coletivo ainda está se preparando. Recarregue em alguns instantes.");
           setHasAnswered(true);
           setCurrentView('home');
        } else {
           alert(`Houve um problema: ${err.message || 'Tente novamente.'}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (responseId: string, type: 'identificado' | 'orando') => {
    if (!user) return;
    const ok = await db.addReaction(responseId, user.id, type);
    if (ok && currentQuestion) {
      const collective = await db.getResponses(currentQuestion.id);
      setCollectiveResponses(collective);
    }
  };

  if (authError === "AUTH_DISABLED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-8 text-center animate-fadeIn">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <ICONS.User className="text-amber-600 w-8 h-8" />
        </div>
        <h2 className="serif text-2xl text-stone-800 mb-4">Configuração Necessária</h2>
        <p className="text-stone-500 text-sm leading-relaxed mb-8">Ative <b>Anonymous Sign-ins</b> no Dashboard do Supabase (Authentication &gt; Providers).</p>
        <button onClick={initApp} className="px-8 py-3 bg-stone-900 text-white rounded-full text-xs uppercase tracking-widest">Tentar Novamente</button>
      </div>
    );
  }

  if (loading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="text-stone-300 animate-pulse text-xs uppercase tracking-widest flex flex-col items-center gap-6">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-stone-300 to-transparent"></div>
          <span className="serif italic text-lg text-stone-400">Escutando o silêncio...</span>
        </div>
      </div>
    );
  }

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 py-12 animate-fadeIn text-center">
      <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-8">Pergunta do Dia</span>
      <h1 className="serif text-3xl md:text-4xl leading-tight font-light text-stone-800 mb-6 px-4">
        &ldquo;{currentQuestion?.text}&rdquo;
      </h1>
      <p className="text-stone-400 text-sm italic font-light mb-12">{currentQuestion?.verseReference}</p>
      
      {!hasAnswered ? (
        <button 
          onClick={() => setCurrentView('answer')}
          className="px-10 py-4 bg-stone-900 text-white rounded-full text-xs font-medium uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-95 shadow-xl shadow-stone-200"
        >
          Responder com honestidade
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
           <span className="text-[10px] text-stone-400 uppercase tracking-widest">A verdade de hoje já foi semeada</span>
           <button 
             onClick={() => setCurrentView('collective')}
             className="px-10 py-4 border border-stone-200 text-stone-600 rounded-full text-xs font-medium uppercase tracking-widest hover:bg-stone-50 transition-all"
           >
             Ver vozes do dia
           </button>
        </div>
      )}
    </div>
  );

  const renderAnswer = () => (
    <div className="flex flex-col min-h-[90vh] px-6 py-12 animate-fadeIn pb-32">
      <button onClick={() => setCurrentView('home')} className="self-start p-2 -ml-2 text-stone-400">
        <ICONS.Back className="w-6 h-6" />
      </button>
      <div className="mt-8">
        <h2 className="serif text-xl text-stone-700 font-light mb-8">{currentQuestion?.text}</h2>
        <textarea
          autoFocus
          maxLength={500}
          value={myAnswer}
          onChange={(e) => setMyAnswer(e.target.value)}
          placeholder="Derrame sua verdade aqui..."
          className="w-full h-48 bg-transparent border-b border-stone-100 focus:border-stone-900 outline-none resize-none py-2 text-stone-800 placeholder-stone-200 transition-all text-lg leading-relaxed"
        />
        <div className="flex justify-between items-center mt-4 text-[9px] text-stone-300 uppercase tracking-widest">
          <span>{myAnswer.length} / 500</span>
          <span>Escrita segura</span>
        </div>
        <div className="mt-12">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-4 font-semibold">Identidade na Resposta</p>
          <div className="flex flex-col gap-3">
            {[
              { id: 'anonymous', label: 'Anônimo', desc: 'Sua privacidade é absoluta' },
              { id: 'pseudonym', label: 'Pseudônimo', desc: 'Um codinome para sua jornada' },
              { id: 'real_name', label: 'Nome Real', desc: 'Assuma sua voz' }
            ].map(opt => (
              <div key={opt.id} className="flex flex-col">
                <button 
                  onClick={() => setDisplayMode(opt.id as UserDisplayMode)}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-sm transition-all ${displayMode === opt.id ? 'border-stone-900 bg-stone-900 text-white shadow-lg' : 'border-stone-100 text-stone-500 bg-white'}`}
                >
                  <div className="text-left">
                    <p className="font-medium text-[11px] uppercase tracking-widest">{opt.label}</p>
                    <p className={`text-[10px] mt-0.5 ${displayMode === opt.id ? 'text-stone-400' : 'text-stone-300'}`}>{opt.desc}</p>
                  </div>
                  {displayMode === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </button>
                {displayMode === opt.id && opt.id !== 'anonymous' && (
                  <input 
                    type="text"
                    placeholder={opt.id === 'pseudonym' ? "Seu pseudônimo..." : "Seu nome real..."}
                    value={opt.id === 'pseudonym' ? userPseudonym : userName}
                    onChange={(e) => opt.id === 'pseudonym' ? setUserPseudonym(e.target.value) : setUserName(e.target.value)}
                    className="mx-4 -mt-1 p-3 bg-stone-50 border-x border-b border-stone-100 outline-none text-stone-700 text-sm focus:border-stone-400 transition-all rounded-b-xl"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <button 
          disabled={myAnswer.length < 5 || loading}
          onClick={handleSendResponse}
          className={`mt-12 w-full py-5 rounded-full text-xs font-medium uppercase tracking-widest transition-all ${myAnswer.length < 5 || loading ? 'bg-stone-50 text-stone-200' : 'bg-stone-900 text-white shadow-xl active:scale-95'}`}
        >
          {loading ? 'Semeando...' : 'Entregar Reflexão'}
        </button>
      </div>
    </div>
  );

  const renderCollective = () => (
    <div className="flex flex-col min-h-screen px-6 py-12 pb-24 animate-fadeIn">
      <div className="flex items-center justify-between mb-10 border-b border-stone-50 pb-6">
        <div>
           <h2 className="serif text-2xl font-light text-stone-800">Vozes do Dia</h2>
           <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Ecos de honestidade</p>
        </div>
        <span className="text-[10px] font-medium bg-stone-100 px-3 py-1 rounded-full text-stone-500">{collectiveResponses.length}</span>
      </div>
      <div className="space-y-6">
        {collectiveResponses.map((res) => (
          <div key={res.id} className="p-6 bg-white rounded-3xl border border-stone-50 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-5 h-5 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">
                  <ICONS.User className="w-2.5 h-2.5" />
               </div>
               <span className="text-[9px] uppercase tracking-widest text-stone-400 font-medium">
                  {res.displayMode === 'anonymous' ? 'Anônimo' : res.displayMode === 'real_name' ? res.userName : res.userPseudonym}
               </span>
            </div>
            <p className="text-stone-700 leading-relaxed text-base font-light mb-6 italic">&ldquo;{res.content}&rdquo;</p>
            <div className="flex gap-6 pt-4 border-t border-stone-50">
              <button onClick={() => handleReaction(res.id, 'identificado')} className="flex items-center gap-2 text-stone-300 hover:text-stone-800 transition-colors group">
                <ICONS.Heart className="w-3.5 h-3.5 group-active:scale-125 transition-transform" />
                <span className="text-[9px] uppercase tracking-tighter">Identificado ({res.reactions.identificado})</span>
              </button>
              <button onClick={() => handleReaction(res.id, 'orando')} className="flex items-center gap-2 text-stone-300 hover:text-stone-800 transition-colors group">
                <ICONS.Hands className="w-3.5 h-3.5 group-active:scale-125 transition-transform" />
                <span className="text-[9px] uppercase tracking-tighter">Orando ({res.reactions.orando})</span>
              </button>
            </div>
          </div>
        ))}
        {collectiveResponses.length === 0 && (
          <div className="text-center py-32 text-stone-300 italic font-light text-sm">O silêncio ainda reina por aqui hoje...</div>
        )}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="flex flex-col min-h-screen px-6 py-12 pb-24 animate-fadeIn">
      <div className="mb-12">
        <h2 className="serif text-2xl font-light text-stone-800 mb-2">Sua Jornada</h2>
        <p className="text-stone-400 text-[10px] uppercase tracking-widest font-light">Onde a verdade foi semeada</p>
      </div>
      <div className="space-y-8">
        {myHistory.map((res) => (
          <div key={res.id} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-stone-100">
            <div className="mb-3">
              <span className="text-[9px] uppercase tracking-widest text-stone-400 block mb-1">
                {new Date(res.createdAt || '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
              <p className="text-xs text-stone-500 font-medium italic">Reflexão Diária</p>
            </div>
            <p className="text-stone-800 text-sm font-light leading-relaxed bg-stone-50/50 p-4 rounded-2xl border border-stone-50">{res.content}</p>
          </div>
        ))}
        {myHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-stone-300">
             <ICONS.History className="w-8 h-8 mb-4 opacity-10" />
             <p className="italic font-light text-xs uppercase tracking-widest">Nenhum registro ainda</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="flex flex-col min-h-screen px-8 py-12 pb-24 animate-fadeIn leading-relaxed text-stone-600">
      <h2 className="serif text-3xl font-light text-stone-900 mb-8 leading-tight">Um refúgio para<br/>a alma honesta.</h2>
      <div className="space-y-6 text-sm font-light leading-relaxed">
        <p>O <strong>Pergunta que Dói</strong> não é uma rede social, é um quintal de autoexame.</p>
        <p>Esquecemos que a cura começa onde a máscara cai.</p>
        <div className="py-8 border-y border-stone-50 my-8">
          <h3 className="text-[9px] uppercase tracking-[0.3em] text-stone-400 mb-6 font-bold">Por que estamos aqui?</h3>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <span className="w-1.5 h-1.5 bg-stone-900 rounded-full mt-1.5 shrink-0"></span>
              <span className="text-stone-500"><strong>Silêncio Seletivo:</strong> Apenas uma pergunta por dia. Menos ruído.</span>
            </li>
            <li className="flex gap-4">
              <span className="w-1.5 h-1.5 bg-stone-900 rounded-full mt-1.5 shrink-0"></span>
              <span className="text-stone-500"><strong>Honestidade Radical:</strong> Você só ouve os outros quando fala a sua verdade.</span>
            </li>
          </ul>
        </div>
        <p className="italic text-stone-400 text-[10px] tracking-widest text-center py-8 uppercase">&ldquo;Conhecereis a verdade, e a verdade vos libertará.&rdquo;</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home': return renderHome();
      case 'answer': return renderAnswer();
      case 'collective': return renderCollective();
      case 'history': return renderHistory();
      case 'about': return renderAbout();
      default: return renderHome();
    }
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#FCFCFC] relative shadow-2xl shadow-stone-200/50 flex flex-col">
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      {currentView !== 'answer' && !authError && <Navigation currentView={currentView} setView={setCurrentView} />}
    </main>
  );
};

export default App;
