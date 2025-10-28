import { useState, useEffect } from 'react';
import { User } from '../types';

const STORAGE_KEY = 'reporting_system_user';

const mockUsers: User[] = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin'
  },
  {
    id: 'user1',
    name: 'Ana Clara',
    email: 'anaclarauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'anaclarauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user2',
    name: 'Adryan',
    email: 'adryanconsultoruniminas@gmail.com',
    role: 'user',
    consultantEmail: 'adryanconsultoruniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user3',
    name: 'Alexia Fernandes',
    email: 'alexiauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'alexiauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user4',
    name: 'Analice Almeida da Costa',
    email: 'analiceuniminas@gmail.com',
    role: 'user',
    consultantEmail: 'analiceuniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user5',
    name: 'Diego Gomes',
    email: 'diegouniminas@gmail.com',
    role: 'user',
    consultantEmail: 'diegouniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user6',
    name: 'Dyuly',
    email: 'dyulyuniminas@gmail.com',
    role: 'user',
    consultantEmail: 'dyulyuniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user7',
    name: 'Eduardo Alves',
    email: 'eduardouniminasead@gmail.com',
    role: 'user',
    consultantEmail: 'eduardouniminasead@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user8',
    name: 'Emanuelle Karine',
    email: 'emanuelleuniminas@gmail.com',
    role: 'user',
    consultantEmail: 'analiceuniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user9',
    name: 'Estefania Santos',
    email: 'consultoraeducacionalestefania@gmail.com',
    role: 'user',
    consultantEmail: 'consultoraeducacionalestefania@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user10',
    name: 'Fernanda',
    email: 'fernandauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'fernandauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user11',
    name: 'Fernando',
    email: 'fernandoconsultor.uniminas@gmail.com',
    role: 'user',
    consultantEmail: 'fernandoconsultor.uniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user12',
    name: 'Geisislane Maria Barbosa',
    email: 'geisislaneuniminas@gmail.com',
    role: 'user',
    consultantEmail: 'geisislaneuniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user13',
    name: 'Giovana Castro',
    email: 'giovanacastrouniminas@gmail.com',
    role: 'user',
    consultantEmail: 'giovanacastrouniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user14',
    name: 'Janaina Guedes',
    email: 'janainauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'janainauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user15',
    name: 'Joana Fernandes',
    email: 'uniminasjoana@gmail.com',
    role: 'user',
    consultantEmail: 'uniminasjoana@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user16',
    name: 'João Victor',
    email: 'joaovictoruniminas@gmail.com',
    role: 'user',
    consultantEmail: 'joaovictoruniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user17',
    name: 'Julia Detone',
    email: 'uniminasjulia@gmail.com',
    role: 'user',
    consultantEmail: 'uniminasjulia@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user18',
    name: 'Juliana Valente',
    email: 'uniminasjuliana@gmail.com',
    role: 'user',
    consultantEmail: 'uniminasjuliana@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user19',
    name: 'Karolaynne',
    email: 'karolaynneuniminas@gmail.com',
    role: 'user',
    consultantEmail: 'karolaynneuniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user20',
    name: 'Ketlen Rafaela Ferreira Santos',
    email: 'ketlenuniminas@gmail.com',
    role: 'user',
    consultantEmail: 'ketlenuniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user21',
    name: 'Laura Carvalho',
    email: 'lauracarvalhouniminas@gmail.com',
    role: 'user',
    consultantEmail: 'lauracarvalhouniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user22',
    name: 'Luana Aparecida Dias',
    email: 'luanadiasconsultorauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'luanadiasconsultorauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user23',
    name: 'Luiza',
    email: 'luizauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'luizauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user24',
    name: 'Maria Eduarda Costa',
    email: 'mariauniminas10@gmail.com',
    role: 'user',
    consultantEmail: 'mariauniminas10@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user25',
    name: 'Marianne Vilela',
    email: 'marianneconsultoruniminas@gmail.com',
    role: 'user',
    consultantEmail: 'marianneconsultoruniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user26',
    name: 'Marilha Abreu Assis Marques',
    email: 'marilhauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'marilhauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user27',
    name: 'Matheus Henrique',
    email: 'matheusconsultoruniminas@gmail.com',
    role: 'user',
    consultantEmail: 'matheusconsultoruniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user28',
    name: 'Monica',
    email: 'monicauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'monicauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user29',
    name: 'Paula Maciel',
    email: 'paulauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'paulauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user30',
    name: 'Sanyelle Ferreira',
    email: 'sanyellesany08@gmail.com',
    role: 'user',
    consultantEmail: 'sanyellesany08@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user31',
    name: 'Tracy Andrade Caetano',
    email: 'tracyconsultorauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'tracyconsultorauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user32',
    name: 'Victor Luiz Esteves Santos',
    email: 'victorluizuniminas@gmail.com',
    role: 'user',
    consultantEmail: 'victorluizuniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user33',
    name: 'Vitor Almeida Conde',
    email: 'uniminasvitor@gmail.com',
    role: 'user',
    consultantEmail: 'uniminasvitor@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user34',
    name: 'Vitor Felipe',
    email: 'vitoruniminas@gmail.com',
    role: 'user',
    consultantEmail: 'vitoruniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user25',
    name: 'Vitoria Silva',
    email: 'vitoriauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'vitoriauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user36',
    name: 'Vittor Ferreira Dias',
    email: 'vittorfdiasfacuvix@gmail.com',
    role: 'user',
    consultantEmail: 'vittorfdiasfacuvix@gmail.com' // Email para buscar no CRM
  }
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      window.location.reload();
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // Clear global cache when logging out
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user'
  };
};