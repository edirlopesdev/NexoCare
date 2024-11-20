import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  Menu,
  Calendar,
  Palette,
  BadgeCheck,
  CreditCard,
  Package
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { signOut } from '../auth/auth';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { title: "Dashboard", icon: Home, url: "/dashboard" },
  { title: "Agendamentos", icon: Calendar, url: "/agendamentos" },
  { title: "Pacientes", icon: Users, url: "/pacientes" },
  { title: "Perfis", icon: BadgeCheck, url: "/perfis" },
  { title: "Planos", icon: CreditCard, url: "/planos" },
  { title: "Produtos", icon: Package, url: "/produtos" },
  { title: "Configurações", icon: Settings, url: "/settings" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className={`bg-gray-800 text-white h-screen ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <h1 className="text-xl font-bold">Nexo Care</h1>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white">
          <Menu size={24} />
        </button>
      </div>
      <nav>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.url}
            className="flex items-center p-4 hover:bg-gray-700 transition-colors duration-200"
          >
            <item.icon className={`sidebar-icon ${isCollapsed ? 'sidebar-icon-collapsed' : ''}`} size={20} />
            {!isCollapsed && <span className="ml-2">{item.title}</span>}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="flex items-center space-x-2 hover:opacity-80 cursor-pointer">
              <Avatar>
                <AvatarFallback>{user?.email ? getInitials(user.email) : 'U'}</AvatarFallback>
              </Avatar>
              {!isCollapsed && <span className="truncate">{user?.email || 'Usuário'}</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Configurações</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
