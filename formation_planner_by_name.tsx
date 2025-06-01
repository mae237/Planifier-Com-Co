import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Settings, BarChart3, Clock, MapPin, Monitor, BookOpen } from 'lucide-react';

const FormationPlanner = () => {
  const [mode, setMode] = useState('backward'); // 'backward' or 'forward'
  const [referenceDate, setReferenceDate] = useState('2026-07-03');
  const [periods, setPeriods] = useState([]);
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    type: 'Formation',
    modalite: 'présentiel',
    duration: '',
    plateforme: ''
  });

  const periodTypes = {
    'Formation': { color: 'bg-blue-100 border-blue-300 text-blue-800', icon: '📚' },
    'Stage': { color: 'bg-green-100 border-green-300 text-green-800', icon: '🏢' },
    'Vacances': { color: 'bg-yellow-100 border-yellow-300 text-yellow-800', icon: '🏖️' },
    'Examen': { color: 'bg-red-100 border-red-300 text-red-800', icon: '📝' },
    'Projet': { color: 'bg-purple-100 border-purple-300 text-purple-800', icon: '🚀' }
  };

  const modaliteTypes = {
    'présentiel': { 
      color: 'bg-orange-100 border-orange-400 text-orange-800', 
      icon: <MapPin size={16} />, 
      label: 'Présentiel',
      description: 'Formation en salle avec formateur'
    },
    'distanciel': { 
      color: 'bg-cyan-100 border-cyan-400 text-cyan-800', 
      icon: <Monitor size={16} />, 
      label: 'Distanciel',
      description: 'Formation 100% en ligne'
    },
    'mix learning': { 
      color: 'bg-violet-100 border-violet-400 text-violet-800', 
      icon: <BookOpen size={16} />, 
      label: 'Mix Learning',
      description: 'Formation mixte (présentiel + distanciel)'
    }
  };

  // Fonction pour générer une couleur basée sur l'intitulé
  const getColorForName = (name) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-red-100 border-red-300 text-red-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-teal-100 border-teal-300 text-teal-800',
      'bg-cyan-100 border-cyan-300 text-cyan-800'
    ];
    
    const cleanName = name.toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      const char = cleanName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const [colorCache, setColorCache] = useState({});

  const getColorWithCache = (name) => {
    const cleanName = name.toLowerCase().trim();
    if (!colorCache[cleanName]) {
      const newColor = getColorForName(name);
      setColorCache(prev => ({ ...prev, [cleanName]: newColor }));
      return newColor;
    }
    return colorCache[cleanName];
  };

  // Fonction pour obtenir le lundi d'une semaine
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Fonction pour obtenir le vendredi d'une semaine
  const getFriday = (mondayDate) => {
    const friday = new Date(mondayDate);
    friday.setDate(friday.getDate() + 4);
    return friday;
  };

  // Fonction pour ajouter/soustraire des semaines
  const addWeeks = (date, weeks) => {
    const result = new Date(date);
    result.setDate(result.getDate() + (weeks * 7));
    return result;
  };

  // Calcul des dates pour chaque période
  const calculateDates = () => {
    if (periods.length === 0) return [];
    
    const results = [];
    
    if (mode === 'backward') {
      let currentEndDate = new Date(referenceDate);
      
      while (currentEndDate.getDay() !== 5) {
        currentEndDate.setDate(currentEndDate.getDate() - 1);
      }
      
      for (let i = periods.length - 1; i >= 0; i--) {
        const period = periods[i];
        const endDate = new Date(currentEndDate);
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - (period.duration - 1) * 7 - 4);
        
        results.unshift({
          ...period,
          startDate,
          endDate,
          color: getColorWithCache(period.name)
        });
        
        currentEndDate = new Date(startDate);
        currentEndDate.setDate(currentEndDate.getDate() - 3);
      }
    } else {
      let currentStartDate = getMonday(new Date(referenceDate));
      
      for (const period of periods) {
        const startDate = new Date(currentStartDate);
        const endDate = getFriday(addWeeks(startDate, period.duration - 1));
        
        results.push({
          ...period,
          startDate,
          endDate,
          color: getColorWithCache(period.name)
        });
        
        currentStartDate = addWeeks(endDate, 1);
        currentStartDate = getMonday(currentStartDate);
      }
    }
    
    return results;
  };

  const calculatedPeriods = calculateDates();

  // Fonction pour formater une date
  const formatDate = (date) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Ajouter une période
  const addPeriod = () => {
    if (newPeriod.name.trim() && newPeriod.duration && parseInt(newPeriod.duration) > 0) {
      setPeriods([...periods, { 
        ...newPeriod, 
        duration: parseInt(newPeriod.duration), 
        id: Date.now() 
      }]);
      setNewPeriod({ 
        name: '', 
        type: 'Formation', 
        modalite: 'présentiel', 
        duration: '', 
        plateforme: '' 
      });
    }
  };

  // Supprimer une période
  const deletePeriod = (id) => {
    setPeriods(periods.filter(p => p.id !== id));
  };

  // Calculer les statistiques
  const getStats = () => {
    const statsByName = {};
    const statsByType = {};
    const statsByModalite = {};
    let totalWeeks = 0;
    
    periods.forEach(period => {
      statsByName[period.name] = (statsByName[period.name] || 0) + period.duration;
      statsByType[period.type] = (statsByType[period.type] || 0) + period.duration;
      statsByModalite[period.modalite] = (statsByModalite[period.modalite] || 0) + period.duration;
      totalWeeks += period.duration;
    });
    
    return { statsByName, statsByType, statsByModalite, totalWeeks };
  };

  const { statsByName, statsByType, statsByModalite, totalWeeks } = getStats();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Calendar className="text-blue-600" />
          Planificateur de formations multi-modalités
        </h1>
        <p className="text-gray-600">Gérez vos formations en présentiel, distanciel et mix learning</p>
      </div>

      {/* Configuration */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Settings size={20} />
          Configuration initiale
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode de planification</label>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="backward">🔄 Mode à rebours (recommandé 2026)</option>
              <option value="forward">➡️ Mode chronologique</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'backward' ? 'Date de fin de référence' : 'Date de début de référence'}
            </label>
            <input
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Ajout de période */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} />
          Ajouter une période de formation
        </h2>
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la formation</label>
              <input
                type="text"
                placeholder="ex: Formation React avancé"
                value={newPeriod.name}
                onChange={(e) => setNewPeriod({...newPeriod, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newPeriod.type}
                onChange={(e) => setNewPeriod({...newPeriod, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.keys(periodTypes).map(type => (
                  <option key={type} value={type}>
                    {periodTypes[type].icon} {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modalité</label>
              <select
                value={newPeriod.modalite}
                onChange={(e) => setNewPeriod({...newPeriod, modalite: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(modaliteTypes).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {modaliteTypes[newPeriod.modalite].description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (semaines)</label>
              <input
                type="number"
                min="1"
                max="52"
                placeholder="ex: 3"
                value={newPeriod.duration}
                onChange={(e) => setNewPeriod({...newPeriod, duration: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={addPeriod}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>
          </div>

          {/* Champs supplémentaires selon la modalité */}
          {(newPeriod.modalite === 'distanciel' || newPeriod.modalite === 'mix learning') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plateforme</label>
              <input
                type="text"
                placeholder="ex: Teams, Zoom, Moodle"
                value={newPeriod.plateforme}
                onChange={(e) => setNewPeriod({...newPeriod, plateforme: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Liste des périodes */}
      {periods.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={20} />
              Périodes définies ({periods.length})
            </h2>
          </div>
          
          <div className="p-4 space-y-3">
            {periods.map((period, index) => (
              <div key={period.id} className={`p-4 rounded-lg border-2 ${getColorWithCache(period.name)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{periodTypes[period.type].icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{period.name}</h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${modaliteTypes[period.modalite].color}`}>
                          {modaliteTypes[period.modalite].icon}
                          {modaliteTypes[period.modalite].label}
                        </div>
                      </div>
                      <p className="text-sm opacity-75 mb-2">
                        {period.type} • {period.duration} semaine{period.duration > 1 ? 's' : ''}
                      </p>
                      
                      {/* Informations spécifiques à la modalité */}
                      <div className="text-xs space-y-1">
                        {(period.modalite === 'distanciel' || period.modalite === 'mix learning') && period.plateforme && (
                          <div className="flex items-center gap-1">
                            <Monitor size={12} />
                            <span>Plateforme: {period.plateforme}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePeriod(period.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline calculée */}
      {calculatedPeriods.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={20} />
              Planning généré automatiquement
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            {calculatedPeriods.map((period, index) => (
              <div key={index} className={`p-6 rounded-lg border-2 ${period.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{periodTypes[period.type].icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{period.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 text-xs font-medium bg-white bg-opacity-50 rounded-full">
                          {period.type}
                        </span>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${modaliteTypes[period.modalite].color}`}>
                          {modaliteTypes[period.modalite].icon}
                          {modaliteTypes[period.modalite].label}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium bg-white bg-opacity-50 px-3 py-1 rounded-full">
                    {period.duration} semaine{period.duration > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                  <div className="bg-white bg-opacity-30 p-3 rounded border-2 border-blue-400">
                    <span className="font-medium">🗓️ Début (Lundi) : </span>
                    <span className="font-bold text-blue-800">{formatDate(period.startDate)}</span>
                  </div>
                  <div className="bg-white bg-opacity-30 p-3 rounded border-2 border-blue-400">
                    <span className="font-medium">🏁 Fin (Vendredi) : </span>
                    <span className="font-bold text-blue-800">{formatDate(period.endDate)}</span>
                  </div>
                </div>

                {/* Informations logistiques */}
                {(period.modalite === 'distanciel' || period.modalite === 'mix learning') && period.plateforme ? (
                  <div className="bg-white bg-opacity-20 p-3 rounded border border-white border-opacity-30">
                    <h4 className="font-medium mb-2 text-xs uppercase tracking-wide">Informations logistiques</h4>
                    <div className="text-sm space-y-1">
                      {(period.modalite === 'distanciel' || period.modalite === 'mix learning') && period.plateforme && (
                        <div className="flex items-center gap-2">
                          <Monitor size={14} />
                          <span><strong>Plateforme:</strong> {period.plateforme}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques */}
      {periods.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Statistiques du planning
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Répartition par intitulé de formation */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Répartition par formation</h3>
              <div className="space-y-2">
                {Object.entries(statsByName).map(([name, weeks]) => (
                  <div key={name} className={`flex justify-between items-center p-3 rounded border-2 ${getColorWithCache(name)}`}>
                    <span className="font-medium text-sm">{name}</span>
                    <span className="font-bold text-lg">{weeks} sem.</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Répartition par type */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Répartition par type</h3>
              <div className="space-y-2">
                {Object.entries(statsByType).map(([type, weeks]) => (
                  <div key={type} className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                    <span className="flex items-center gap-2">
                      <span>{periodTypes[type].icon}</span>
                      <span>{type}</span>
                    </span>
                    <span className="font-semibold">{weeks} sem.</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Total */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Résumé global</h3>
              <div className="bg-white bg-opacity-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{totalWeeks}</div>
                <div className="text-sm text-gray-600">semaines au total</div>
                <div className="text-xs text-gray-500 mt-1">
                  ≈ {Math.round(totalWeeks * 7 / 30.44)} mois
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Formations:</span>
                  <span className="font-medium">{Object.keys(statsByName).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modalités:</span>
                  <span className="font-medium">{Object.keys(statsByModalite).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {periods.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Aucune période définie</h3>
          <p>Commencez par ajouter vos premières périodes de formation avec leurs modalités</p>
        </div>
      )}
    </div>
  );
};

export default FormationPlanner;