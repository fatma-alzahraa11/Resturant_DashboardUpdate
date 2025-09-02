import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: typeof LucideIcon;
  to: string;
  gradient: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  to, 
  gradient 
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(to)}
      className={`relative p-4 sm:p-6 rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${gradient} text-white group overflow-hidden min-w-0 break-words`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
        
        <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-white/90 leading-relaxed min-w-0 break-words">{description}</p>
      </div>
    </div>
  );
};

export default DashboardCard;