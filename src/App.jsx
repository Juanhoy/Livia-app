import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, User, Settings, Download, Upload, Plus, X,
  Search, Globe, Smile, Meh, Frown, Image as ImageIcon,
  Rocket, Calendar, BookOpen, Briefcase, Star, Menu,
  ChevronRight, Check, MoreHorizontal, Trash2, Edit2, Filter, Edit,
  ArrowLeft, DollarSign, Users, PenTool, Link as LinkIcon,
  Clock, AlertCircle, Save, Home, Car, Music, Monitor,
  Dumbbell, Shirt, Sofa, Wallet, TrendingUp, TrendingDown,
  Activity, Heart, Cloud, Compass, Crown, Disc, Eye, Flag,
  GraduationCap, HandHeart, Layers, Leaf, Lightbulb,
  Palette, Plane, Shield, Utensils, Video, Wind, Camera, Tag,
  Baby, PieChart, BarChart3, LogOut, Moon, Sun, Globe2, Mail, Lock,
  UserX, Wrench, Zap, ChevronLeft, Swords, Target, ChevronsUp, ChevronsDown, Minus, ChevronUp, ChevronDown, Gift
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip
} from 'recharts';
import logo from './assets/logo.png';
import logoText from './assets/logo_text.png';
import logoFull from './assets/logo_full.png';
import { useAuth } from './context/AuthContext';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OnboardingWizard from './components/OnboardingWizard';
import TourGuide from './components/TourGuide';

// --- Constants & Configuration ---

const CLOUD_NAME = "df0idzqak"; // Extracted from your provided URL
const UPLOAD_PRESET = "livia_unsigned"; // IMPORTANT: Create an "Unsigned" upload preset in Cloudinary settings and name it this, or change this value.

const getScoreColor = (score) => {
  if (score < 50) return { color: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500', hex: '#ef4444' };
  if (score < 85) return { color: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500', hex: '#eab308' };
  return { color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', hex: '#10b981' };
};

const getImportanceConfig = (imp) => {
  switch (imp) {
    case 'High': return { icon: <ChevronsUp size={12} />, label: 'High' };
    case 'Low': return { icon: <ChevronsDown size={12} />, label: 'Low' };
    default: return { icon: <Minus size={12} />, label: 'Medium' };
  }
};

const DEFAULT_DIMENSIONS = [
  { key: "health", name: "Health", max: 50, color: "#4caf50", weight: 15 },
  { key: "family", name: "Family", max: 12, color: "#2196f3", weight: 15 },
  { key: "freedom", name: "Freedom", max: 5, color: "#00bcd4", weight: 10 },
  { key: "community", name: "Community", max: 8, color: "#9c27b0", weight: 10 },
  { key: "management", name: "Management", max: 10, color: "#ff9800", weight: 15 },
  { key: "learning", name: "Learning", max: 5, color: "#795548", weight: 10 },
  { key: "creation", name: "Creation", max: 5, color: "#e91e63", weight: 15 },
  { key: "fun", name: "Fun", max: 5, color: "#ffeb3b", weight: 10 }
];

const RESOURCE_CATEGORIES = [
  { id: 'money', label: 'Money', icon: <Wallet size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'vehicles', label: 'Vehicles', icon: <Car size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'houses', label: 'Houses', icon: <Home size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'studio', label: 'Studio', icon: <PenTool size={24} />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'electronics', label: 'Electronics', icon: <Monitor size={24} />, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  { id: 'furniture', label: 'Furniture', icon: <Sofa size={24} />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'gym_and_sports', label: 'Gym & Sports', icon: <Dumbbell size={24} />, color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'musical_instruments', label: 'Instruments', icon: <Music size={24} />, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'wishlist', label: 'Wishlist', icon: <Star size={24} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'clothes', label: 'Clothes', icon: <Shirt size={24} />, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
];

// --- Theme Colors ---
const THEMES = {
  dark: {
    bg: 'bg-[#121212]',
    bgSecondary: 'bg-[#1e1e1e]',
    bgTertiary: 'bg-[#2a2a2a]',
    bgQuaternary: 'bg-[#333]',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-gray-800',
    input: 'bg-[#1e1e1e]',
    sidebar: 'bg-[#1e1e1e]',
    sidebarHover: 'hover:bg-gray-800',
    emphasis: '#86FCDA', // Mint Green
    emphasisText: 'text-[#86FCDA]',
    emphasisBg: 'bg-[#86FCDA]',
    emphasisBorder: 'border-[#86FCDA]',
  },
  light: {
    bg: 'bg-gray-100',
    bgSecondary: 'bg-white',
    bgTertiary: 'bg-gray-50',
    bgQuaternary: 'bg-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    border: 'border-gray-200',
    input: 'bg-white',
    sidebar: 'bg-white',
    sidebarHover: 'hover:bg-gray-100',
    emphasis: '#218CC4', // Blue
    emphasisText: 'text-[#218CC4]',
    emphasisBg: 'bg-[#218CC4]',
    emphasisBorder: 'border-[#218CC4]',
  }
};

// Helper: Generate past dates for dummy history
const generateHistory = (probability = 0.7) => {
  const history = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    if (Math.random() < probability) {
      history.push(d.toISOString().split('T')[0]);
    }
  }
  return history;
};

// Helper: Upload to Cloudinary
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Upload failed");

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Fallback to local FileReader if cloud fails or isn't configured
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
};

// Helper to generate realistic initial data
// Helper to generate realistic initial data
const generateInitialData = () => {
  const dims = {};
  DEFAULT_DIMENSIONS.forEach(d => {
    dims[d.name] = { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] } };
  });

  return dims;
};

// --- Localization ---
const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard", lifeBalance: "Life Balance", lifeRoles: "Life Roles", lifeSkills: "Life Skills", lifeResources: "Life Resources", myTime: "My Time", visualization: "Visualization",
    netWorth: "Net Worth", monthlyIncome: "Monthly Income", monthlyExpenses: "Monthly Expenses",
    challenges: "Challenges", goals: "Goals", projects: "Projects", routines: "Routines",
    add: "Add", save: "Save", delete: "Delete", cancel: "Cancel", edit: "Edit", export: "Export",
    upload: "Upload", settings: "Settings", logOut: "Log Out", guestMode: "Guest Mode",
    welcome: "Welcome", continueGuest: "Continue as Guest", login: "Login",
    liquidAssets: "Liquid Assets", liabilities: "Liabilities",
    daily: "Daily", weekly: "Weekly", monthly: "Monthly",
    overallScore: "Overall Score", totalWeight: "Total Weight",
    health: "Health", family: "Family", freedom: "Freedom", community: "Community", management: "Management", learning: "Learning", creation: "Creation", fun: "Fun",
    savingToLocal: "Saving to Local", notSaving: "Not Saving", uploadsDisabledGuest: "Uploads disabled in Guest Mode", deleteImageConfirm: "Delete this image?",
    exportDisabledGuest: "Export disabled in Guest Mode", exportFailed: "Failed to export visualization.", uploading: "Uploading...", addImage: "Add Image",
    panInstruction: "[Space] + Drag to Pan", zoomInstruction: "[Ctrl] + Scroll to Zoom", noRolesAdded: "You haven't added any roles yet.", openLibrary: "Open Library",
    removeItemConfirm: "Remove this item?", backToRoles: "Back to Roles", level: "Level", activeMissions: "Active Missions", noActiveMissions: "No active missions linked to this role.",
    masteryHabits: "Mastery & Habits", skills: "Skills", routines: "Routines", inventoryHave: "Inventory (Have)", noResourcesLinked: "No resources linked.",
    needsWishlist: "Needs (Wishlist)", noItemsNeeded: "No items needed.", roleResources: "Role Resources", item: "Item", saveChanges: "Save Changes",
    uploadPhoto: "Upload Photo", disabledGuest: "Disabled in Guest Mode", changePhoto: "Change Photo", name: "Name", categoryWidget: "Category (Widget)",
    masteryMode: "Mastery Mode", auto: "Auto", manual: "Manual", manualSet: "Manual Set", autoCalculated: "Auto-Calculated",
    levelLinked: "Level is linked to the completion status of connected missions.", importance: "Importance", low: "Low", medium: "Medium", high: "High",
    status: "Status", dueDate: "Due Date", value: "Value", condition: "Condition", new: "New", likeNew: "Like New", good: "Good", fair: "Fair", poor: "Poor",
    weight: "Weight", settingsNotSavedGuest: "Settings cannot be saved in Guest Mode.", theme: "Theme", dark: "Dark", light: "Light", language: "Language",
    userName: "User Name", yourNamePlaceholder: "Your Name", email: "Email", password: "Password", createAccount: "Create Account", needAccount: "Need an account? Sign Up",
    haveAccount: "Already have an account? Login", editDimensions: "Edit Dimensions", editDimensionsDesc: "Adjust the names and weights of your life dimensions.",
    deleteRoleConfirm: "Are you sure you want to delete this role?", deleteSkillConfirm: "Delete this skill?", deleteResourceConfirm: "Delete this resource?",
    general: "General", noSkills: "No skills tracked yet.", addSkillPrompt: "Add skills to track your growth.", addSkill: "Add Skill", addResource: "Add Resource",
    newItem: "New Item", focusWeek: "Focus for This Week", focusMonth: "Focus for This Month", focusToday: "Focus for Today",
    noWeeklyRoutines: "No weekly routines set.", noMonthlyRoutines: "No monthly routines set.", noDailyTasks: "No daily tasks scheduled.", addTask: "Add new task",
    done: "Done", yourRoles: "Your Roles", roleLibrary: "Role Library", createCustom: "Create Custom", level1: "Level 1", xp: "XP",
    roleLibraryTitle: "Role Library", allRolesActive: "All available roles are currently active.", createCustomRoleTitle: "Create Custom Role",
    roleName: "Role Name", roleNamePlaceholder: "e.g. Musician, Gamer, Chef...", createRole: "Create Role", dueToday: "Due Today",
    weeklyGoal: "Weekly Goal", monthlyGoal: "Monthly Goal", money: "Money", tools: "Tools", knowledge: "Knowledge", people: "People", energy: "Energy",
    weeklyGoal: "Weekly Goal", monthlyGoal: "Monthly Goal", money: "Money", tools: "Tools", knowledge: "Knowledge", people: "People", energy: "Energy",
    description: "Description", connectedGoal: "Connected Goal", connectedChallenge: "Connected Challenge", connectedSkill: "Connected Skill", select: "Select",
    vehicles: "Vehicles", houses: "Houses", studio: "Studio", electronics: "Electronics", furniture: "Furniture", gym_and_sports: "Gym & Sports", musical_instruments: "Instruments", wishlist: "Wishlist", clothes: "Clothes",
    moneyThisMonth: "MONEY THIS MONTH", thisMonthIncomes: "This month Incomes", addMonthlyIncome: "Add monthly income",
    thisMonthExpenses: "This month Expenses", addMonthlyExpense: "Add monthly expense",
    totalInvestedMoney: "TOTAL INVESTED MONEY", noInvestmentsYet: "No investments yet", addInvestment: "Add Investment",
    totalIndebtedMoney: "TOTAL INDEBTED MONEY", noDebtsYet: "No debts yet", addDebt: "Add Debt",
    type: "Type", income: "Income", expense: "Expense", investment: "Investment", debt: "Debt",
    frequency: "Frequency", monthly: "Monthly", oneTime: "One Time / Extra",
    profilePicture: "Profile Picture", changeAvatar: "Change Avatar",
    editRole: "Edit Role", active: "Active", noRolesAvailable: "No roles available in library.",
    selectRole: "Select a Role", selectGoal: "Select a Goal", selectChallenge: "Select a Challenge", selectSkill: "Select a Skill",
    editRole: "Edit Role", active: "Active", noRolesAvailable: "No roles available in library.",
    deleteDimensionConfirm: "Delete this dimension? This action cannot be undone.",
    supportUs: "Support Us", supportDesc: "Help us continue gamifying life!",
    supportStory: "We believe that life can be as engaging as a video game. We are building tools to help you level up your skills, resources, and relationships. If you like what we do, consider supporting us!",
    donatePaypal: "Donate via PayPal", scanBancolombia: "Scan for Bancolombia", scanNequi: "Scan for Nequi"
  },
  es: {
    dashboard: "Tablero", lifeBalance: "Balance de Vida", lifeRoles: "Roles de Vida", lifeSkills: "Habilidades", lifeResources: "Recursos", myTime: "Mi Tiempo", visualization: "Visualización",
    netWorth: "Patrimonio Neto", monthlyIncome: "Ingresos Mensuales", monthlyExpenses: "Gastos Mensuales",
    challenges: "Desafíos", goals: "Metas", projects: "Proyectos", routines: "Rutinas",
    add: "Agregar", save: "Guardar", delete: "Eliminar", cancel: "Cancelar", edit: "Editar", export: "Exportar",
    upload: "Subir", settings: "Configuración", logOut: "Cerrar Sesión", guestMode: "Modo Invitado",
    welcome: "Bienvenido", continueGuest: "Continuar como Invitado", login: "Iniciar Sesión",
    liquidAssets: "Activos Líquidos", liabilities: "Pasivos",
    daily: "Diario", weekly: "Semanal", monthly: "Mensual",
    overallScore: "Puntaje General", totalWeight: "Peso Total",
    health: "Salud", family: "Familia", freedom: "Libertad", community: "Comunidad", management: "Gestión", learning: "Aprendizaje", creation: "Creación", fun: "Diversión",
    done: "Hecho", yourRoles: "Tus Roles", roleLibrary: "Biblioteca de Roles", createCustom: "Crear Personalizado", level1: "Nivel 1", xp: "XP",
    roleLibraryTitle: "Biblioteca de Roles", allRolesActive: "Todos los roles disponibles están activos.", createCustomRoleTitle: "Crear Rol Personalizado",
    selectRole: "Seleccionar un Rol", selectGoal: "Seleccionar una Meta", selectChallenge: "Seleccionar un Reto", selectSkill: "Seleccionar una Habilidad",
    roleName: "Nombre del Rol", roleNamePlaceholder: "ej. Músico, Gamer, Chef...", createRole: "Crear Rol", dueToday: "Vence Hoy",
    weeklyGoal: "Meta Semanal", monthlyGoal: "Meta Mensual", money: "Dinero", tools: "Herramientas", knowledge: "Conocimiento", people: "Personas", energy: "Energía",
    newItem: "Nuevo Ítem", addTask: "Añadir nueva tarea", value: "Valor", deleteResourceConfirm: "¿Eliminar este recurso?",
    focusWeek: "Enfoque Semanal", focusMonth: "Enfoque Mensual", focusToday: "Enfoque de Hoy",
    noWeeklyRoutines: "Sin rutinas semanales.", noMonthlyRoutines: "Sin rutinas mensuales.", noDailyTasks: "Sin tareas diarias.",
    // Missing Translations Added
    addResource: "Agregar Recurso", addSkill: "Agregar Habilidad", addSkillPrompt: "Añade habilidades para rastrear tu crecimiento.",
    noSkills: "Aún no hay habilidades rastreadas.", general: "General", deleteSkillConfirm: "¿Eliminar esta habilidad?",
    deleteRoleConfirm: "¿Estás seguro de que quieres eliminar este rol?", editDimensions: "Editar Dimensiones",
    editDimensionsDesc: "Ajusta los nombres y pesos de tus dimensiones de vida.", haveAccount: "¿Ya tienes una cuenta? Inicia Sesión",
    createAccount: "Crear Cuenta", needAccount: "¿Necesitas una cuenta? Regístrate", password: "Contraseña", email: "Correo Electrónico",
    yourNamePlaceholder: "Tu Nombre", userName: "Nombre de Usuario", language: "Idioma", theme: "Tema", dark: "Oscuro", light: "Claro",
    settingsNotSavedGuest: "La configuración no se puede guardar en Modo Invitado.", weight: "Peso", poor: "Pobre", fair: "Justo",
    good: "Bueno", likeNew: "Como Nuevo", new: "Nuevo", condition: "Condición", dueDate: "Fecha de Vencimiento",
    status: "Estado", high: "Alto", medium: "Medio", low: "Bajo", importance: "Importancia",
    levelLinked: "El nivel está vinculado al estado de finalización de las misiones conectadas.", autoCalculated: "Calculado Automáticamente",
    manualSet: "Ajuste Manual", manual: "Manual", auto: "Auto", masteryMode: "Modo de Maestría", categoryWidget: "Categoría (Widget)",
    name: "Nombre", changePhoto: "Cambiar Foto", disabledGuest: "Deshabilitado en Modo Invitado", uploadPhoto: "Subir Foto",
    saveChanges: "Guardar Cambios", item: "Ítem", roleResources: "Recursos del Rol", noItemsNeeded: "No se necesitan artículos.",
    needsWishlist: "Necesidades (Lista de Deseos)", noResourcesLinked: "No hay recursos vinculados.", inventoryHave: "Inventario (Tener)",
    skills: "Habilidades", masteryHabits: "Maestría y Hábitos", noActiveMissions: "No hay misiones activas vinculadas a este rol.",
    activeMissions: "Misiones Activas", level: "Nivel", backToRoles: "Volver a Roles", removeItemConfirm: "¿Eliminar este elemento?",
    openLibrary: "Abrir Biblioteca", noRolesAdded: "Aún no has agregado ningún rol.", zoomInstruction: "[Ctrl] + Desplazarse para Zoom",
    panInstruction: "[Espacio] + Arrastrar para Panorámica", addImage: "Añadir Imagen", uploading: "Subiendo...",
    exportFailed: "Error al exportar visualización.", exportDisabledGuest: "Exportación deshabilitada en Modo Invitado",
    deleteImageConfirm: "¿Eliminar esta imagen?", uploadsDisabledGuest: "Cargas deshabilitadas en Modo Invitado",
    notSaving: "No Guardando", savingToLocal: "Guardando en Local", creation: "Creación", learning: "Aprendizaje",
    description: "Descripción", connectedGoal: "Meta Conectada", connectedChallenge: "Desafío Conectado", connectedSkill: "Habilidad Conectada", select: "Seleccionar",
    vehicles: "Vehículos", houses: "Casas", studio: "Estudio", electronics: "Electrónica", furniture: "Muebles", gym_and_sports: "Gimnasio y Deportes", musical_instruments: "Instrumentos", wishlist: "Lista de Deseos", clothes: "Ropa",
    moneyThisMonth: "DINERO ESTE MES", thisMonthIncomes: "Ingresos de este mes", addMonthlyIncome: "Agregar ingreso mensual",
    thisMonthExpenses: "Gastos de este mes", addMonthlyExpense: "Agregar gasto mensual",
    totalInvestedMoney: "DINERO TOTAL INVERTIDO", noInvestmentsYet: "Aún no hay inversiones", addInvestment: "Agregar Inversión",
    totalIndebtedMoney: "DINERO TOTAL EN DEUDA", noDebtsYet: "Aún no hay deudas", addDebt: "Agregar Deuda",
    type: "Tipo", income: "Ingreso", expense: "Gasto", investment: "Inversión", debt: "Deuda",
    frequency: "Frecuencia", monthly: "Mensual", oneTime: "Única Vez / Extra",
    profilePicture: "Foto de Perfil", changeAvatar: "Cambiar Avatar",
    editRole: "Editar Rol", active: "Activo", noRolesAvailable: "No hay roles disponibles en la biblioteca.",
    deleteDimensionConfirm: "¿Eliminar esta dimensión? Esta acción no se puede deshacer.",
    supportUs: "Apóyanos", supportDesc: "¡Ayúdanos a seguir gamificando la vida!",
    supportStory: "Creemos que la vida puede ser tan atractiva como un videojuego. Estamos construyendo herramientas para ayudarte a subir de nivel tus habilidades, recursos y relaciones. Si te gusta lo que hacemos, ¡considera apoyarnos!",
    donatePaypal: "Donar vía PayPal", scanBancolombia: "Escanear Bancolombia", scanNequi: "Escanear Nequi"
  },
  fr: {
    dashboard: "Tableau de bord", lifeBalance: "Équilibre de vie", lifeRoles: "Rôles de vie", lifeSkills: "Compétences", lifeResources: "Ressources", myTime: "Mon temps", visualization: "Visualisation",
    netWorth: "Valeur Nette", monthlyIncome: "Revenu Mensuel", monthlyExpenses: "Dépenses Mensuelles",
    challenges: "Défis", goals: "Objectifs", projects: "Projets", routines: "Routines",
    add: "Ajouter", save: "Sauvegarder", delete: "Supprimer", cancel: "Annuler", edit: "Modifier", export: "Exporter",
    upload: "Télécharger", settings: "Paramètres", logOut: "Déconnexion", guestMode: "Mode Invité",
    welcome: "Bienvenue", continueGuest: "Continuer en Invité", login: "Connexion",
    liquidAssets: "Actifs Liquides", liabilities: "Passifs",
    daily: "Quotidien", weekly: "Hebdomadaire", monthly: "Mensuel",
    overallScore: "Score Global", totalWeight: "Poids Total",
    health: "Santé", family: "Famille", freedom: "Liberté", community: "Communauté", management: "Gestion", learning: "Apprentissage", creation: "Création", fun: "Plaisir",
    done: "Terminé", yourRoles: "Vos Rôles", roleLibrary: "Bibliothèque de Rôles", createCustom: "Créer Personnalisé", level1: "Niveau 1", xp: "XP",
    roleLibraryTitle: "Bibliothèque de Rôles", allRolesActive: "Tous les rôles disponibles sont actifs.", createCustomRoleTitle: "Créer un Rôle Personnalisé",
    roleName: "Nom du Rôle", roleNamePlaceholder: "ex. Musicien, Gamer, Chef...", createRole: "Créer Rôle", dueToday: "Pour Aujourd'hui",
    weeklyGoal: "Objectif Hebdo", monthlyGoal: "Objectif Mensuel", money: "Argent", tools: "Outils", knowledge: "Savoir", people: "Gens", energy: "Énergie",
    newItem: "Nouvel Élément", addTask: "Ajouter une tâche", value: "Valeur", deleteResourceConfirm: "Supprimer cette ressource ?",
    focusWeek: "Focus de la semaine", focusMonth: "Focus du mois", focusToday: "Focus d'aujourd'hui",
    focusWeek: "Focus de la semaine", focusMonth: "Focus du mois", focusToday: "Focus d'aujourd'hui",
    noWeeklyRoutines: "Aucune routine hebdomadaire.", noMonthlyRoutines: "Aucune routine mensuelle.", noDailyTasks: "Aucune tâche quotidienne.",
    vehicles: "Véhicules", houses: "Maisons", studio: "Studio", electronics: "Électronique", furniture: "Meubles", gym_and_sports: "Gym et Sports", musical_instruments: "Instruments", wishlist: "Liste de Vœux", clothes: "Vêtements"
  },
  de: {
    dashboard: "Armaturenbrett", lifeBalance: "Lebensbalance", lifeRoles: "Lebensrollen", lifeSkills: "Lebenskompetenzen", lifeResources: "Lebensressourcen", myTime: "Meine Zeit", visualization: "Visualisierung",
    netWorth: "Reinvermögen", monthlyIncome: "Monatliches Einkommen", monthlyExpenses: "Monatliche Ausgaben",
    challenges: "Herausforderungen", goals: "Ziele", projects: "Projekte", routines: "Routinen",
    add: "Hinzufügen", save: "Speichern", delete: "Löschen", cancel: "Abbrechen", edit: "Bearbeiten", export: "Exportieren",
    upload: "Hochladen", settings: "Einstellungen", logOut: "Abmelden", guestMode: "Gastmodus",
    welcome: "Willkommen", continueGuest: "Als Gast fortfahren", login: "Anmelden",
    liquidAssets: "Flüssige Mittel", liabilities: "Verbindlichkeiten",
    daily: "Täglich", weekly: "Wöchentlich", monthly: "Monatlich",
    overallScore: "Gesamtpunktzahl", totalWeight: "Gesamtgewicht",
    health: "Gesundheit", family: "Familie", freedom: "Freiheit", community: "Gemeinschaft", management: "Management", learning: "Lernen", creation: "Schöpfung", fun: "Spaß",
    done: "Fertig", yourRoles: "Deine Rollen", roleLibrary: "Rollenbibliothek", createCustom: "Benutzerdefiniert", level1: "Level 1", xp: "XP",
    roleLibraryTitle: "Rollenbibliothek", allRolesActive: "Alle verfügbaren Rollen sind aktiv.", createCustomRoleTitle: "Benutzerdefinierte Rolle erstellen",
    roleName: "Rollenname", roleNamePlaceholder: "z.B. Musiker, Gamer, Koch...", createRole: "Rolle erstellen", dueToday: "Heute fällig",
    weeklyGoal: "Wochenziel", monthlyGoal: "Monatsziel", money: "Geld", tools: "Werkzeuge", knowledge: "Wissen", people: "Menschen", energy: "Energie",
    newItem: "Neues Element", addTask: "Neue Aufgabe hinzufügen", value: "Wert", deleteResourceConfirm: "Diese Ressource löschen?",
    focusWeek: "Fokus für diese Woche", focusMonth: "Fokus für diesen Monat", focusToday: "Fokus für heute",
    focusWeek: "Fokus für diese Woche", focusMonth: "Fokus für diesen Monat", focusToday: "Fokus für heute",
    noWeeklyRoutines: "Keine wöchentlichen Routinen.", noMonthlyRoutines: "Keine monatlichen Routinen.", noDailyTasks: "Keine täglichen Aufgaben.",
    vehicles: "Fahrzeuge", houses: "Häuser", studio: "Studio", electronics: "Elektronik", furniture: "Möbel", gym_and_sports: "Fitness & Sport", musical_instruments: "Instrumente", wishlist: "Wunschliste", clothes: "Kleidung"
  },
  pt: {
    dashboard: "Painel", lifeBalance: "Equilíbrio de Vida", lifeRoles: "Papéis de Vida", lifeSkills: "Habilidades", lifeResources: "Recursos", myTime: "Meu Tempo", visualization: "Visualização",
    netWorth: "Patrimônio Líquido", monthlyIncome: "Renda Mensal", monthlyExpenses: "Despesas Mensais",
    challenges: "Desafios", goals: "Metas", projects: "Projetos", routines: "Rotinas",
    add: "Adicionar", save: "Salvar", delete: "Excluir", cancel: "Cancelar", edit: "Editar", export: "Exportar",
    upload: "Carregar", settings: "Configurações", logOut: "Sair", guestMode: "Modo Convidado",
    welcome: "Bem-vindo", continueGuest: "Continuar como Convidado", login: "Entrar",
    liquidAssets: "Ativos Líquidos", liabilities: "Passivos",
    daily: "Diário", weekly: "Semanal", monthly: "Mensal",
    overallScore: "Pontuação Geral", totalWeight: "Peso Total",
    health: "Saúde", family: "Família", freedom: "Liberdade", community: "Comunidade", management: "Gestão", learning: "Aprendizado", creation: "Criação", fun: "Diversão",
    done: "Concluído", yourRoles: "Seus Papéis", roleLibrary: "Biblioteca de Papéis", createCustom: "Criar Personalizado", level1: "Nível 1", xp: "XP",
    roleLibraryTitle: "Biblioteca de Papéis", allRolesActive: "Todos os papéis disponíveis estão ativos.", createCustomRoleTitle: "Criar Papel Personalizado",
    roleName: "Nome do Papel", roleNamePlaceholder: "ex. Músico, Gamer, Chef...", createRole: "Criar Papel", dueToday: "Vence Hoje",
    weeklyGoal: "Meta Semanal", monthlyGoal: "Meta Mensal", money: "Dinheiro", tools: "Ferramentas", knowledge: "Conhecimento", people: "Pessoas", energy: "Energia",
    newItem: "Novo Item", addTask: "Adicionar nova tarefa", value: "Valor", deleteResourceConfirm: "Excluir este recurso?",
    focusWeek: "Foco desta Semana", focusMonth: "Foco deste Mês", focusToday: "Foco de Hoje",
    focusWeek: "Foco desta Semana", focusMonth: "Foco deste Mês", focusToday: "Foco de Hoje",
    noWeeklyRoutines: "Sem rotinas semanais.", noMonthlyRoutines: "Sem rotinas mensais.", noDailyTasks: "Sem tarefas diárias.",
    vehicles: "Veículos", houses: "Casas", studio: "Estúdio", electronics: "Eletrônicos", furniture: "Móveis", gym_and_sports: "Academia e Esportes", musical_instruments: "Instrumentos", wishlist: "Lista de Desejos", clothes: "Roupas"
  },
  zh: {
    dashboard: "仪表板", lifeBalance: "生活平衡", lifeRoles: "生活角色", lifeSkills: "生活技能", lifeResources: "生活资源", myTime: "我的时间", visualization: "愿景板",
    netWorth: "净资产", monthlyIncome: "月收入", monthlyExpenses: "月支出",
    challenges: "挑战", goals: "目标", projects: "项目", routines: "日常",
    add: "添加", save: "保存", delete: "删除", cancel: "取消", edit: "编辑", export: "导出",
    upload: "上传", settings: "设置", logOut: "登出", guestMode: "访客模式",
    welcome: "欢迎", continueGuest: "以访客身份继续", login: "登录",
    liquidAssets: "流动资产", liabilities: "负债",
    daily: "每日", weekly: "每周", monthly: "每月",
    overallScore: "总分", totalWeight: "总权重",
    health: "健康", family: "家庭", freedom: "自由", community: "社区", management: "管理", learning: "学习", creation: "创造", fun: "娱乐",
    done: "完成", yourRoles: "你的角色", roleLibrary: "角色库", createCustom: "创建自定义", level1: "等级 1", xp: "XP",
    roleLibraryTitle: "角色库", allRolesActive: "所有可用角色均已激活。", createCustomRoleTitle: "创建自定义角色",
    roleName: "角色名称", roleNamePlaceholder: "例如：音乐家、游戏玩家、厨师...", createRole: "创建角色", dueToday: "今天到期",
    weeklyGoal: "每周目标", monthlyGoal: "每月目标", money: "金钱", tools: "工具", knowledge: "知识", people: "人脉", energy: "精力",
    newItem: "新项目", addTask: "添加新任务", value: "价值", deleteResourceConfirm: "删除此资源？",
    focusWeek: "本周重点", focusMonth: "本月重点", focusToday: "今日重点",
    focusWeek: "本周重点", focusMonth: "本月重点", focusToday: "今日重点",
    noWeeklyRoutines: "没有每周例行事务。", noMonthlyRoutines: "没有每月例行事务。", noDailyTasks: "没有每日任务。",
    vehicles: "车辆", houses: "房屋", studio: "工作室", electronics: "电子产品", furniture: "家具", gym_and_sports: "健身与运动", musical_instruments: "乐器", wishlist: "愿望清单", clothes: "衣服"
  },
  ja: {
    dashboard: "ダッシュボード", lifeBalance: "ライフバランス", lifeRoles: "ライフロール", lifeSkills: "ライフスキル", lifeResources: "ライフリソース", myTime: "マイタイム", visualization: "ビジュアライゼーション",
    netWorth: "純資産", monthlyIncome: "月収", monthlyExpenses: "月次支出",
    challenges: "課題", goals: "目標", projects: "プロジェクト", routines: "ルーチン",
    add: "追加", save: "保存", delete: "削除", cancel: "キャンセル", edit: "編集", export: "エクスポート",
    upload: "アップロード", settings: "設定", logOut: "ログアウト", guestMode: "ゲストモード",
    welcome: "ようこそ", continueGuest: "ゲストとして続行", login: "ログイン",
    liquidAssets: "流動資産", liabilities: "負債",
    daily: "毎日", weekly: "毎週", monthly: "毎月",
    overallScore: "総合スコア", totalWeight: "総重量",
    health: "健康", family: "家族", freedom: "自由", community: "コミュニティ", management: "管理", learning: "学習", creation: "創造", fun: "楽しみ",
    done: "完了", yourRoles: "あなたの役割", roleLibrary: "役割ライブラリ", createCustom: "カスタム作成", level1: "レベル 1", xp: "XP",
    roleLibraryTitle: "役割ライブラリ", allRolesActive: "利用可能なすべての役割がアクティブです。", createCustomRoleTitle: "カスタム役割を作成",
    roleName: "役割名", roleNamePlaceholder: "例：ミュージシャン、ゲーマー、シェフ...", createRole: "役割を作成", dueToday: "今日期限",
    weeklyGoal: "週の目標", monthlyGoal: "月の目標", money: "お金", tools: "ツール", knowledge: "知識", people: "人々", energy: "エネルギー",
    newItem: "新しいアイテム", addTask: "新しいタスクを追加", value: "価値", deleteResourceConfirm: "このリソースを削除しますか？",
    focusWeek: "今週のフォーカス", focusMonth: "今月のフォーカス", focusToday: "今日のフォーカス",
    focusWeek: "今週のフォーカス", focusMonth: "今月のフォーカス", focusToday: "今日のフォーカス",
    noWeeklyRoutines: "週次ルーチンはありません。", noMonthlyRoutines: "月次ルーチンはありません。", noDailyTasks: "今日のタスクはありません。",
    vehicles: "乗り物", houses: "家", studio: "スタジオ", electronics: "電子機器", furniture: "家具", gym_and_sports: "ジム＆スポーツ", musical_instruments: "楽器", wishlist: "ウィッシュリスト", clothes: "服"
  }
};

const getBrowserLanguage = () => {
  const lang = navigator.language.split('-')[0];
  return TRANSLATIONS[lang] ? lang : 'en';
};

const DEFAULT_DATA = {
  appSettings: {
    userName: "User",
    userEmail: "user@example.com",
    userAvatar: null,
    theme: 'dark',
    language: getBrowserLanguage(),
    hasSeenTour: false,
    loginCount: 0,
    userRoles: [
      { key: "human", name: "Human", icon: "User" },
      { key: "son", name: "Son/Daughter", icon: "Heart" },
      { key: "citizen", name: "Citizen", icon: "Flag" }
    ],
    roleLibrary: [
      { key: "human", name: "Human", icon: "User" },
      { key: "son", name: "Son", icon: "Heart" },
      { key: "citizen", name: "Citizen", icon: "Flag" },
      { key: "friend", name: "Friend", icon: "Users" },
      { key: "professional", name: "Professional", icon: "Briefcase" },
      { key: "student", name: "Student", icon: "GraduationCap" },
      { key: "athlete", name: "Athlete", icon: "Dumbbell" },
    ],
    dimensionConfig: [
      { key: "health", name: "Health", max: 50, color: "#4caf50", weight: 15 },
      { key: "family", name: "Family", max: 12, color: "#2196f3", weight: 15 },
      { key: "freedom", name: "Freedom", max: 5, color: "#00bcd4", weight: 10 },
      { key: "community", name: "Community", max: 8, color: "#9c27b0", weight: 10 },
      { key: "management", name: "Management", max: 10, color: "#ff9800", weight: 15 },
      { key: "learning", name: "Learning", max: 5, color: "#795548", weight: 10 },
      { key: "creation", name: "Creation", max: 5, color: "#e91e63", weight: 15 },
      { key: "fun", name: "Fun", max: 5, color: "#ffeb3b", weight: 10 }
    ]
  },
  dimensions: generateInitialData(),
  skills: [],
  resources: [],
  wishlist: [],
  visualizationImages: [],
  today: {
    date: new Date().toISOString().split('T')[0],
    tasks: []
  }
};

// --- Helper Functions ---

// Calculate Routine Adherence based on Account Creation Date
const calculateRoutineAdherence = (routine, accountCreationDate, frequency = 'daily') => {
  if (!routine) return 0;

  const creationDate = new Date(accountCreationDate || new Date());
  const today = new Date();
  const history = routine.completionHistory || [];

  // Calculate total expected occurrences since creation
  let expected = 0;
  const diffTime = Math.abs(today - creationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (frequency === 'daily') {
    expected = Math.max(1, diffDays);
  } else if (frequency === 'weekly') {
    expected = Math.max(1, Math.ceil(diffDays / 7));
  } else if (frequency === 'monthly') {
    expected = Math.max(1, Math.ceil(diffDays / 30));
  }

  // Calculate actual completions
  // Filter history to ensure we only count valid dates (and potentially unique ones if needed, though toggle logic should handle uniqueness)
  const actual = history.length;

  // Cap at 100%
  return Math.min(100, Math.round((actual / expected) * 100));
};

const calculateDimensionScore = (dimData, accountCreationDate) => {
  if (!dimData) return 0;
  let totalItems = 0;
  let totalScore = 0;

  const processList = (list, type, freq) => {
    if (!list) return;
    list.forEach(item => {
      // Projects only contribute if they have progress (>0) - Positive impact only (Additive Bonus)
      if (type === 'projects') {
        if ((item.status || 0) > 0) {
          // Do NOT increment totalItems for projects, they are additive bonuses
          totalScore += item.status;
        }
      } else if (type === 'routines') {
        // Routines use adherence calculation
        totalItems++;
        const adherence = calculateRoutineAdherence(item, accountCreationDate, freq);
        totalScore += adherence;
      } else {
        // Goals, Challenges always contribute
        totalItems++;
        totalScore += (item.status || 0);
      }
    });
  };

  processList(dimData.goals, 'goals');
  processList(dimData.projects, 'projects');
  processList(dimData.challenges, 'challenges');
  processList(dimData.routines?.daily, 'routines', 'daily');
  processList(dimData.routines?.weekly, 'routines', 'weekly');
  processList(dimData.routines?.monthly, 'routines', 'monthly');

  // If we have items, divide by count. If only projects (count=0), divide by 1.
  const finalScore = Math.round(totalScore / Math.max(1, totalItems));
  return Math.min(100, finalScore);
};

const calculateRoleXP = (roleKey, allData) => {
  let xp = 0;
  const checkItem = (item) => { if (item.roleKey === roleKey) xp += (item.status || 0); };
  Object.values(allData.dimensions).forEach(dim => {
    if (!dim) return;
    dim.goals?.forEach(checkItem);
    dim.projects?.forEach(checkItem);
    dim.challenges?.forEach(checkItem);
    dim.routines?.daily?.forEach(checkItem);
    dim.routines?.weekly?.forEach(checkItem);
    dim.routines?.monthly?.forEach(checkItem);
  });
  return xp;
};

const calculateSkillLevel = (skill, allData) => {
  if (skill.manualMode) return skill.level || 0;
  if (!allData?.dimensions) return 0; // Safety check

  let totalStatus = 0;
  let count = 0;
  const accountCreationDate = allData.appSettings?.accountCreationDate;

  const checkItem = (item, type, freq) => {
    if (!item) return;
    if (item.linkedSkillIds && Array.isArray(item.linkedSkillIds) && item.linkedSkillIds.includes(skill.id)) {
      if (type === 'projects') {
        // Projects only contribute if they have progress (>0)
        if ((item.status || 0) > 0) {
          // Do NOT increment count for projects, they are additive bonuses
          totalStatus += item.status;
        }
      } else {
        count++;
        if (type === 'routines') {
          totalStatus += calculateRoutineAdherence(item, accountCreationDate, freq);
        } else {
          totalStatus += (item.status || 0);
        }
      }
    }
  };

  Object.values(allData.dimensions).forEach(dim => {
    if (!dim) return;
    dim.goals?.forEach(i => checkItem(i, 'goals'));
    dim.projects?.forEach(i => checkItem(i, 'projects'));
    dim.challenges?.forEach(i => checkItem(i, 'challenges'));
    dim.routines?.daily?.forEach(i => checkItem(i, 'routines', 'daily'));
    dim.routines?.weekly?.forEach(i => checkItem(i, 'routines', 'weekly'));
    dim.routines?.monthly?.forEach(i => checkItem(i, 'routines', 'monthly'));
  });

  // If we have items, divide by count. If only projects (count=0), divide by 1.
  const finalScore = Math.round(totalStatus / Math.max(1, count));
  return Math.min(100, finalScore);
};

// --- Components ---

const hasUserCreatedContent = (data) => {
  if (!data) return false;
  if (data.skills?.length > 0) return true;
  if (data.resources?.length > 0) return true;
  if (data.wishlist?.length > 0) return true;
  if (data.visualizationImages?.length > 0) return true;

  // Check for profile customization
  if (data.appSettings?.userName && data.appSettings.userName !== "User") return true;
  if (data.appSettings?.userAvatar) return true;

  // Check for role customization (default has 3 roles)
  if (data.appSettings?.userRoles?.length !== 3) return true;
  if (data.appSettings?.userRoles?.some(r => r.isCustom)) return true;

  // Check dimensions for any items
  if (data.dimensions) {
    for (const dim of Object.values(data.dimensions)) {
      if (dim.challenges?.length > 0) return true;
      if (dim.goals?.length > 0) return true;
      if (dim.projects?.length > 0) return true;
      if (dim.routines?.daily?.length > 0) return true;
      if (dim.routines?.weekly?.length > 0) return true;
      if (dim.routines?.monthly?.length > 0) return true;
    }
  }
  return false;
};

const LandingPage = ({ onGuest, t, theme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { login, signup, googleSignIn, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError("Failed to " + (isLogin ? "login" : "create account") + ": " + err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      await googleSignIn();
    } catch (err) {
      setError("Failed to sign in with Google: " + err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await resetPassword(resetEmail);
      setMessage("Check your inbox for further instructions");
      setShowForgotPassword(false);
    } catch (err) {
      setError("Failed to reset password: " + err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000_100%)]"></div>

      <div className="z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 max-w-7xl w-full">
        {/* Left Side - Hero Image (Desktop Only) */}
        <div className="hidden lg:block relative shrink-0">
          <img
            src="/hero-new.jpg"
            alt="Livia Life Balance"
            className="h-[650px] w-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-[400px] shrink-0">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <img src={logoFull} alt="Livia" className="h-24 object-contain" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Livia</h1>
            <p className="text-gray-400 text-sm">{t('welcome')}</p>
          </div>

          <div className="bg-[#121212] p-8 rounded-xl border border-gray-800 shadow-2xl">
            {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-[3px] px-3 py-2.5 text-sm text-white focus:border-gray-500 focus:outline-none transition-colors placeholder-gray-500"
                    placeholder={t('yourNamePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <input
                  type="email"
                  className="w-full bg-[#1e1e1e] border border-gray-700 rounded-[3px] px-3 py-2.5 text-sm text-white focus:border-gray-500 focus:outline-none transition-colors placeholder-gray-500"
                  placeholder={t('email')} // Simplified placeholder for cleaner look
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  className="w-full bg-[#1e1e1e] border border-gray-700 rounded-[3px] px-3 py-2.5 text-sm text-white focus:border-gray-500 focus:outline-none transition-colors placeholder={t('password')}"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className={`w-full ${THEMES[theme || 'dark'].emphasisBg} hover:opacity-90 text-black font-bold py-1.5 rounded-[4px] transition-colors text-sm mt-2`}>
                {isLogin ? t('login') : t('createAccount')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={handleGoogleSignIn} className="w-full bg-white text-black font-bold py-2 rounded-[4px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-sm">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                Sign in with Google
              </button>
            </div>

            <div className="mt-2 text-center">
              <button onClick={() => setShowForgotPassword(true)} className="text-xs text-blue-400 hover:text-blue-300">
                Forgot Password?
              </button>
            </div>

            <div className="flex items-center my-6">
              <div className="h-px bg-gray-700 flex-1"></div>
              <span className="px-4 text-xs text-gray-500 font-semibold uppercase">OR</span>
              <div className="h-px bg-gray-700 flex-1"></div>
            </div>

            <div className="space-y-4">
              <button onClick={onGuest} className="w-full flex items-center justify-center gap-2 text-[#385185] hover:text-white transition-colors text-sm font-semibold">
                <UserX size={16} />
                {t('continueGuest')}
              </button>

              <div className="text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
                  {isLogin ? t('needAccount') : t('haveAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-700 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-white">Reset Password</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                className="w-full bg-[#121212] border border-gray-600 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForgotPassword(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Modal Components ---

const Modal = ({ isOpen, onClose, title, children, footer, theme }) => {
  if (!isOpen) return null;
  const colors = THEMES[theme || 'dark'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`${colors.bgTertiary} w-full max-w-lg rounded-xl border ${colors.border} shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className={`p-5 border-b ${colors.border} flex justify-between items-center ${colors.bgQuaternary} rounded-t-xl`}>
          <h3 className={`text-xl font-bold ${colors.text}`}>{title}</h3>
          <button onClick={onClose} className={`${colors.textSecondary} hover:${colors.text}`}><X size={20} /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
        {footer && (
          <div className={`p-4 border-t ${colors.border} ${colors.bgSecondary} rounded-b-xl`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, data, setData, t, isGuest }) => {
  if (!isOpen) return null;
  const { appSettings } = data;
  const colors = THEMES[appSettings.theme];

  const handleChange = (field, value) => {
    if (isGuest) {
      alert(t('settingsNotSavedGuest'));
      return;
    }
    setData(prev => ({
      ...prev,
      appSettings: { ...prev.appSettings, [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`${colors.bgSecondary} w-full max-w-md rounded-xl shadow-2xl border ${colors.border} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${colors.text}`}>{t('settings')}</h2>
          <button onClick={onClose} className={`p-2 hover:bg-gray-700 rounded-full ${colors.textSecondary}`}><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>{t('theme')}</label>
            <div className="flex gap-2">
              <button onClick={() => handleChange('theme', 'dark')} className={`flex-1 py-2 rounded-lg border ${appSettings.theme === 'dark' ? `${colors.emphasisBg} ${colors.emphasisBorder} text-black` : `border-gray-600 ${colors.text}`}`}>{t('dark')}</button>
              <button onClick={() => handleChange('theme', 'light')} className={`flex-1 py-2 rounded-lg border ${appSettings.theme === 'light' ? `${colors.emphasisBg} ${colors.emphasisBorder} text-black` : `border-gray-600 ${colors.text}`}`}>{t('light')}</button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>{t('language')}</label>
            <select
              value={appSettings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className={`w-full p-2 rounded-lg border ${colors.border} ${colors.input} ${colors.text}`}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>{t('profilePicture')}</label>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${colors.border}`}>
                {appSettings.userAvatar ? (
                  <img src={appSettings.userAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${colors.bgQuaternary} flex items-center justify-center text-xl font-bold ${colors.text}`}>
                    {appSettings.userName?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <label className={`cursor-pointer px-4 py-2 ${colors.bgSecondary} border ${colors.border} rounded-lg hover:${colors.bgQuaternary} ${colors.text} transition-colors`}>
                {t('changeAvatar')}
                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = await uploadToCloudinary(file);
                    handleChange('userAvatar', url);
                  }
                }} />
              </label>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>{t('userName')}</label>
            <input
              type="text"
              value={appSettings.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              className={`w-full p-2 rounded-lg border ${colors.border} ${colors.input} ${colors.text}`}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">{t('save')}</button>
        </div>
      </div>
    </div>
  );
};

const ItemDetailModal = ({ isOpen, onClose, item, type, roles, skills, data, onSave, theme, isGuest, t }) => {
  const [formData, setFormData] = useState(item || {});
  const [uploading, setUploading] = useState(false);
  const colors = THEMES[theme] || THEMES['dark'];

  const allGoals = data?.dimensions ? Object.values(data.dimensions).flatMap(d => d.goals || []) : [];
  const allProjects = data?.dimensions ? Object.values(data.dimensions).flatMap(d => d.projects || []) : [];
  const allChallenges = data?.dimensions ? Object.values(data.dimensions).flatMap(d => d.challenges || []) : [];


  useEffect(() => { setFormData(item || {}); }, [item]);

  const handleChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); };

  const handleImageUpload = async (e) => {
    if (isGuest) {
      alert(t('uploadsDisabledGuest'));
      return;
    }
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      handleChange('image', url);
      setUploading(false);
    }
  };

  if (!item) return null;

  const isResource = type === 'resources' || type === 'wishlist' || type === 'money' || RESOURCE_CATEGORIES.some(c => c.id === type);
  const isSkill = type === 'skills';
  const autoCalculatedLevel = isSkill && data ? calculateSkillLevel({ ...formData, manualMode: false }, data) : 0;

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={`${t('edit')} ${type ? (t(type) || type.charAt(0).toUpperCase() + type.slice(1)) : t('item')}`}
      theme={theme}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className={`px-4 py-2 ${colors.textSecondary} hover:${colors.text} transition-colors`}>{t('cancel')}</button>
          <button onClick={() => onSave(formData)} className={`px-6 py-2 ${colors.emphasisBg} hover:opacity-90 text-black rounded-lg font-medium flex items-center gap-2 transition-colors`}><Save size={16} /> {t('saveChanges')}</button>
        </div>
      }
    >
      <div className={`space-y-5 ${colors.text}`}>
        {isResource && formData.category !== 'money' && (
          <div className="flex justify-center mb-4">
            <label className={`relative w-full h-48 ${colors.bgSecondary} border-2 border-dashed ${colors.border} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden group ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {formData.image ? (
                <img src={formData.image} alt="Item" className="w-full h-full object-cover" />
              ) : (
                <div className={`flex flex-col items-center ${colors.textSecondary}`}>
                  <Camera size={32} className="mb-2" />
                  <span className="text-sm">{uploading ? t('uploading') : t('uploadPhoto')}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition-opacity">
                {isGuest ? t('disabledGuest') : t('changePhoto')}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isGuest || uploading} />
            </label>
          </div>
        )}

        <div>
          <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('name')}</label>
          <input className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:border-blue-500 focus:outline-none`} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
        </div>

        {/* Routine Frequency Selector */}
        {type === 'routines' && (
          <div className="mt-4">
            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('frequency')}</label>
            <select
              className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`}
              value={formData.frequency || 'daily'}
              onChange={e => handleChange('frequency', e.target.value)}
            >
              <option value="daily">{t('daily')}</option>
              <option value="weekly">{t('weekly')}</option>
              <option value="monthly">{t('monthly')}</option>
            </select>
          </div>
        )}

        {isResource && formData.category !== 'money' && (
          <div>
            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-2`}>{t('categoryWidget')}</label>
            <div className="grid grid-cols-5 gap-2">
              {RESOURCE_CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => handleChange('category', cat.id)}
                  className={`cursor-pointer rounded-lg p-2 flex flex-col items-center justify-center gap-1 border transition-all ${formData.category === cat.id ? `${colors.emphasisBorder} bg-[#333]` : `border-transparent hover:${colors.bgTertiary}`}`}
                >
                  <div className={`${cat.color}`}>{cat.icon && React.isValidElement(cat.icon) ? React.cloneElement(cat.icon, { size: 20 }) : null}</div>
                  <span className={`text-[9px] ${colors.textSecondary} text-center leading-tight`}>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.category === 'money' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('type')}</label>
              <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.moneyType || 'income'} onChange={e => handleChange('moneyType', e.target.value)}>
                <option value="income">{t('income') || 'Income'}</option>
                <option value="expense">{t('expense') || 'Expense'}</option>
                <option value="investment">{t('investment') || 'Investment'}</option>
                <option value="debt">{t('debt') || 'Debt'}</option>
              </select>
            </div>
            {(formData.moneyType === 'income' || formData.moneyType === 'expense') && (
              <div>
                <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('frequency')}</label>
                <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.frequency || 'monthly'} onChange={e => handleChange('frequency', e.target.value)}>
                  <option value="monthly">{t('monthly') || 'Monthly'}</option>
                  <option value="one_time">{t('oneTime') || 'One Time / Extra'}</option>
                </select>
              </div>
            )}
          </div>
        )}

        {isSkill && (
          <div className={`${colors.bgTertiary} p-4 rounded-lg border ${colors.border}`}>
            <div className="flex justify-between items-center mb-4">
              <label className={`text-xs ${colors.textSecondary} uppercase font-bold`}>{t('masteryMode')}</label>
              <div className="flex items-center gap-2 text-sm">
                <span className={!formData.manualMode ? "text-blue-400 font-bold" : "text-gray-500"}>{t('auto')}</span>
                <button
                  onClick={() => handleChange('manualMode', !formData.manualMode)}
                  className={`w-10 h-5 rounded-full p-1 transition-colors relative ${formData.manualMode ? colors.emphasisBg : 'bg-gray-600'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${formData.manualMode ? 'translate-x-5' : ''}`} />
                </button>
                <span className={formData.manualMode ? "text-blue-400 font-bold" : "text-gray-500"}>{t('manual')}</span>
              </div>
            </div>

            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>
              {t('level')} ({formData.manualMode ? t('manualSet') : t('autoCalculated')})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                disabled={!formData.manualMode}
                className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${formData.manualMode ? 'bg-gray-700' : 'bg-gray-800'}`}
                style={{ accentColor: colors.emphasis }}
                value={formData.manualMode ? (formData.level || 0) : autoCalculatedLevel}
                onChange={e => handleChange('level', parseInt(e.target.value))}
              />
              <span className={`w-10 text-right text-sm font-mono ${formData.manualMode ? 'text-blue-400' : 'text-gray-500'}`}>
                {formData.manualMode ? (formData.level || 0) : autoCalculatedLevel}%
              </span>
            </div>

            {!formData.manualMode && (
              <p className={`text-[10px] ${colors.textSecondary} mt-3 flex items-center gap-1.5 ${colors.bgQuaternary} p-2 rounded`}>
                <AlertCircle size={12} />
                <span>{t('levelLinked')}</span>
              </p>
            )}
          </div>
        )}

        {!isSkill && !isResource && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('importance')}</label>
                <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.importance || 'Medium'} onChange={e => handleChange('importance', e.target.value)}>
                  <option>{t('low')}</option><option>{t('medium')}</option><option>{t('high')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('status')} (%)</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="100" className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: colors.emphasis }} value={formData.status || 0} onChange={e => handleChange('status', parseInt(e.target.value))} />
                  <span className="w-10 text-right text-sm text-blue-400">{formData.status}%</span>
                </div>
              </div>
            </div>
            <div>
              <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('dueDate')}</label>
              <input type="date" className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.dueDate || ''} onChange={e => handleChange('dueDate', e.target.value)} />
            </div>
          </>
        )}

        {isResource && (
          <div className="grid grid-cols-2 gap-4">
            <div className={formData.category === 'money' ? "col-span-2" : ""}>
              <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('value')} ($)</label>
              <NumberInput
                value={formData.value || ''}
                onChange={e => handleChange('value', e.target.value)}
                placeholder="0.00"
                className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`}
                theme={theme}
              />
            </div>
            {formData.category !== 'money' && (
              <div>
                <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('condition')}</label>
                <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.condition || 'Good'} onChange={e => handleChange('condition', e.target.value)}>
                  <option>{t('new')}</option><option>{t('likeNew')}</option><option>{t('good')}</option><option>{t('fair')}</option><option>{t('poor')}</option>
                </select>
              </div>
            )}
          </div>
        )}

        {(type === 'goals' || type === 'projects' || type === 'challenges' || type === 'routines') && (
          <div>
            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('lifePillar') || "Life Pillar"}</label>
            <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.dimensionKey || ''} onChange={e => handleChange('dimensionKey', e.target.value)}>
              <option value="">-- {t('selectPillar') || "Select Pillar"} --</option>
              {(data.appSettings.dimensionConfig || DIMENSIONS).map(d => <option key={d.name} value={d.name}>{t(d.name.toLowerCase()) || d.name}</option>)}
              <option value="general">{t('general') || "General / Not Linked"}</option>
            </select>
          </div>
        )}

        {roles && formData.category !== 'money' && (
          <div>
            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('connectedRole') || "Connected Role"}</label>
            <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.roleKey || ''} onChange={e => handleChange('roleKey', e.target.value)}>
              <option value="">{t('selectRole')}</option>
              {roles && roles.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
          </div>
        )}

        {formData.category === 'money' && (
          <div>
            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>Connected Project</label>
            <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.linkedProjectId || ''} onChange={e => handleChange('linkedProjectId', e.target.value)}>
              <option value="">-- No Project Linked --</option>
              {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('description') || "Description"}</label>
          <textarea className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} h-24 resize-none focus:outline-none focus:border-blue-500`} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} />
        </div>

        {(type === 'projects' || type === 'routines') && (
          <div className="space-y-3 pt-4 border-t border-gray-700/50">
            <div>
              <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('connectedGoal')}</label>
              <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.linkedGoalId || ''} onChange={e => handleChange('linkedGoalId', e.target.value)}>
                <option value="">{t('selectGoal')}</option>
                {allGoals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('connectedChallenge')}</label>
              <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.linkedChallengeId || ''} onChange={e => handleChange('linkedChallengeId', e.target.value)}>
                <option value="">{t('selectChallenge')}</option>
                {allChallenges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('connectedSkill')}</label>
              <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.linkedSkillId || ''} onChange={e => handleChange('linkedSkillId', e.target.value)}>
                <option value="">{t('selectSkill')}</option>
                {skills && skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const NumberInput = ({ value, onChange, placeholder, className, theme }) => {
  const colors = THEMES[theme || 'dark'];
  const inputRef = useRef(null);

  const handleIncrement = () => {
    const currentVal = parseFloat(value) || 0;
    onChange({ target: { value: currentVal + 1 } });
  };

  const handleDecrement = () => {
    const currentVal = parseFloat(value) || 0;
    onChange({ target: { value: currentVal - 1 } });
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} pr-8`} // Add padding for the buttons
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        <button
          type="button"
          onClick={handleIncrement}
          className={`p-0.5 rounded-sm hover:${colors.bgQuaternary} ${colors.textSecondary} hover:${colors.text} transition-colors`}
        >
          <ChevronUp size={12} strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          className={`p-0.5 rounded-sm hover:${colors.bgQuaternary} ${colors.textSecondary} hover:${colors.text} transition-colors`}
        >
          <ChevronDown size={12} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

const AddItemInput = ({ onAdd, placeholder, theme }) => {
  const [val, setVal] = useState("");
  const colors = THEMES[theme || 'dark'];
  return (
    <div className="w-full flex gap-2">
      <input type="text" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(val); setVal(""); } }}
        placeholder={placeholder} className={`flex-1 ${colors.input} border ${colors.border} rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${colors.text}`} />
      <button onClick={() => { onAdd(val); setVal(""); }} className={`${colors.emphasisBg} text-black px-3 py-2 rounded text-sm font-medium hover:opacity-90`}><Plus size={16} /></button>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onOpenSettings, onOpenAI, data, theme, isGuest, t }) => {
  const { logout } = useAuth();
  const menuItems = [
    { id: 'visualization', icon: <Rocket size={20} />, label: t('visualization'), tourId: 'nav-visualization' },
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t('lifeBalance'), tourId: 'nav-dashboard' },
    { id: 'roles', icon: <User size={20} />, label: t('lifeRoles'), tourId: 'nav-roles' },
    { id: 'skills', icon: <BookOpen size={20} />, label: t('lifeSkills'), tourId: 'nav-skills' },
    { id: 'resources', icon: <Briefcase size={20} />, label: t('lifeResources'), tourId: 'nav-resources' },
    { id: 'my_time', icon: <Calendar size={20} />, label: t('myTime'), tourId: 'nav-time' },
  ];

  const colors = THEMES[theme];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} h-full ${colors.sidebar} border-r ${colors.border} flex flex-col transition-all duration-300 z-50`}>
      <div className="h-14 flex items-center px-6 border-b border-gray-800/50">
        <img src={logo} alt="Livia" className="w-8 h-8 mr-3 rounded-lg" />
        {isOpen && <span className={`font-bold text-lg ${colors.text}`}>Livia</span>}
      </div>

      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full ${colors.bgQuaternary} flex items-center justify-center overflow-hidden`}>
            {data.appSettings.userAvatar ? <img src={data.appSettings.userAvatar} className="w-full h-full object-cover" /> : <User size={20} className={colors.textSecondary} />}
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <div className={`font-bold text-sm truncate ${colors.text}`}>{data.appSettings.userName}</div>
            </div>
          )}
        </div>
        {isGuest && isOpen && <div className="text-xs text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-700/50 flex items-center gap-1"><AlertCircle size={12} /> {t('guestMode')}</div>}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            id={item.tourId}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === item.id ? `${colors.emphasisBg} text-black shadow-lg` : `${colors.textSecondary} ${colors.sidebarHover} hover:${colors.text}`}`}
          >
            {item.icon}
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800/50 space-y-1">
        <button id="nav-ai-coach" onClick={onOpenAI} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${colors.textSecondary} ${colors.sidebarHover} hover:${colors.text} hover:bg-purple-900/20 hover:text-purple-400`}>
          <Zap size={20} />
          {isOpen && <span className="text-sm font-medium">AI Coach</span>}
        </button>
        <button onClick={() => setActiveTab('support')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'support' ? `${colors.emphasisBg} text-black shadow-lg` : `${colors.textSecondary} ${colors.sidebarHover} hover:${colors.text}`}`}>
          <Gift size={20} />
          {isOpen && <span className="text-sm font-medium">{t('supportUs')}</span>}
        </button>
        <button onClick={onOpenSettings} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${colors.textSecondary} ${colors.sidebarHover} hover:${colors.text} transition-colors`}>
          <Settings size={20} />
          {isOpen && <span className="text-sm font-medium">{t('settings')}</span>}
        </button>
        <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors`}>
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-medium">{t('logOut')}</span>}
        </button>
        <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-center py-2 mt-2 ${colors.textSecondary} hover:${colors.text}`}>
          {isOpen ? <ArrowLeft size={16} /> : <Menu size={16} />}
        </button>
      </div>
    </div>
  );
};

// --- Pages (Theme Aware) ---

const VisualizationPage = ({ images, setImages, theme, isGuest, dimensions, t }) => {
  const [transform, setTransform] = useState({ x: -2000, y: -2000, scale: 1 }); // Start somewhat centered
  const [selectedId, setSelectedId] = useState(null);
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingImage, setDraggingImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const colors = THEMES[theme];

  // Global Key & Wheel Listeners
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.code === 'Space' && !e.repeat) setIsSpacePressed(true); };
    const handleKeyUp = (e) => { if (e.code === 'Space') { setIsSpacePressed(false); setIsPanning(false); } };

    // Non-passive wheel listener to prevent browser zoom
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        setTransform(prev => {
          const newScale = Math.max(0.1, Math.min(5, prev.scale + scaleAmount));
          // Zoom towards mouse pointer
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const scaleRatio = newScale / prev.scale;
          const newX = mouseX - (mouseX - prev.x) * scaleRatio;
          const newY = mouseY - (mouseY - prev.y) * scaleRatio;
          return { x: newX, y: newY, scale: newScale };
        });
      }
    };

    // Center the view on mount
    const container = containerRef.current;
    if (container) {
      const { clientWidth, clientHeight } = container;
      setTransform({
        x: (clientWidth / 2) - 1500, // 1500 is half of 3000 (canvas size)
        y: (clientHeight / 2) - 1500,
        scale: 1
      });

      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (isSpacePressed || e.button === 1) { // Middle click or Space+Left
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      e.preventDefault();
    } else {
      // Deselect if clicking empty space
      if (e.target === containerRef.current) setSelectedId(null);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setTransform(prev => ({ ...prev, x: e.clientX - panStart.x, y: e.clientY - panStart.y }));
      return;
    }
    if (draggingImage) {
      const dx = (e.clientX - draggingImage.startX) / transform.scale;
      const dy = (e.clientY - draggingImage.startY) / transform.scale;
      setImages(prev => prev.map(img =>
        img.id === draggingImage.id ? { ...img, x: draggingImage.originalX + dx, y: draggingImage.originalY + dy } : img
      ));
    }
  };

  const handleMouseUp = () => { setIsPanning(false); setDraggingImage(null); };

  const handleImageUpload = async (e) => {
    if (isGuest) { alert(t('uploadsDisabledGuest')); return; }
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      // Add to center of current view
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = (-transform.x + rect.width / 2) / transform.scale;
      const centerY = (-transform.y + rect.height / 2) / transform.scale;

      setImages(prev => [...prev, { id: Date.now(), src: url, x: centerX, y: centerY, width: 300 }]);
      setUploading(false);
    }
  };

  const updateImage = (id, updates) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const deleteImage = (id) => {
    if (window.confirm(t('deleteImageConfirm'))) setImages(prev => prev.filter(img => img.id !== id));
  };

  // Radial Chart Background Generator
  const renderRadialGuide = () => {
    const size = 3000;
    const center = size / 2;
    const radius = 250; // 500px diameter as requested
    const dims = dimensions || [];
    if (dims.length < 3) return null;

    const angleStep = (Math.PI * 2) / dims.length;
    const axes = dims.map((dim, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      // Text radius should be slightly larger than the chart radius
      const textRadius = radius + 60;
      const tx = center + Math.cos(angle) * textRadius;
      const ty = center + Math.sin(angle) * textRadius;
      return { x, y, tx, ty, name: dim.name };
    });

    // Subtle colors for the guide
    const guideColor = theme === 'dark' ? '#333' : '#e5e5e5';
    const textColor = theme === 'dark' ? '#444' : '#ccc';

    return (
      <svg width={size} height={size} className="absolute top-0 left-0 pointer-events-none">
        {/* Webs */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(r => (
          <polygon key={r} points={axes.map(a => {
            const x = center + (a.x - center) * r;
            const y = center + (a.y - center) * r;
            return `${x},${y}`;
          }).join(' ')} fill="none" stroke={guideColor} strokeWidth="2" />
        ))}
        {/* Axes */}
        {axes.map((a, i) => (
          <g key={i}>
            <line x1={center} y1={center} x2={a.x} y2={a.y} stroke={guideColor} strokeWidth="2" />
            <text x={a.tx} y={a.ty} fill={textColor} fontSize="24" textAnchor="middle" dominantBaseline="middle">{t(a.name.toLowerCase()) || a.name}</text>
          </g>
        ))}
        <circle cx={center} cy={center} r={10} fill={guideColor} />
      </svg>
    );
  };

  const handleExport = async () => {
    if (isGuest) { alert(t('exportDisabledGuest')); return; }
    try {
      const canvas = await import('html2canvas').then(m => m.default(containerRef.current, {
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f3f4f6',
        scale: 1, // Export at 1:1 scale of the container (which is huge, 3000x3000)
        logging: false,
        useCORS: true // For Cloudinary images
      }));
      const link = document.createElement('a');
      link.download = 'livia-visualization.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert(t('exportFailed'));
    }
  };

  return (
    <div className={`flex flex-col h-full ${colors.bg} ${colors.text} overflow-hidden relative`}>
      <div className={`absolute top-4 left-4 z-20 flex gap-2`}>
        <label className={`flex items-center gap-2 px-4 py-2 ${colors.emphasisBg} hover:opacity-90 rounded cursor-pointer text-sm text-black shadow-lg ${isGuest || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload size={16} /> {uploading ? t('uploading') : t('addImage')}
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isGuest || uploading} />
        </label>
        <button onClick={handleExport} className={`flex items-center gap-2 px-4 py-2 ${colors.bgTertiary} hover:bg-gray-700 rounded text-sm ${colors.text} shadow-lg border ${colors.border}`}>
          <Download size={16} /> {t('export')}
        </button>
        <div className={`${colors.bgTertiary} px-4 py-2 rounded text-xs ${colors.textSecondary} border ${colors.border} shadow-lg flex items-center gap-2`}>
          <span className={isSpacePressed ? "text-blue-400 font-bold" : ""}>{t('panInstruction')}</span>
          <span>|</span>
          <span>{t('zoomInstruction')}</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} cursor-${isSpacePressed ? 'grab' : 'default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', width: '3000px', height: '3000px' }} className={`relative ${theme === 'dark' ? 'bg-[radial-gradient(#333_1px,transparent_1px)]' : 'bg-[radial-gradient(#ccc_1px,transparent_1px)]'} bg-[length:50px_50px]`}>

          {renderRadialGuide()}

          {images.map(img => (
            <div
              key={img.id}
              className={`absolute group ${selectedId === img.id ? 'z-50' : 'z-10'}`}
              style={{ left: img.x, top: img.y, width: img.width }}
              onMouseDown={(e) => {
                if (isSpacePressed) return;
                e.stopPropagation();
                setSelectedId(img.id);
                setDraggingImage({ id: img.id, startX: e.clientX, startY: e.clientY, originalX: img.x, originalY: img.y });
              }}
            >
              <img src={img.src} draggable={false} className={`w-full h-auto rounded shadow-2xl select-none ${selectedId === img.id ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-white/50'}`} />

              {selectedId === img.id && (
                <>
                  {/* Resize Handle (Simple width adjustment) */}
                  <div
                    className="absolute -bottom-3 -right-3 w-6 h-6 bg-blue-500 rounded-full cursor-se-resize shadow-lg z-50"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const startX = e.clientX;
                      const startWidth = img.width;
                      const handleResize = (moveEvent) => {
                        const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX) / transform.scale);
                        updateImage(img.id, { width: newWidth });
                      };
                      const stopResize = () => {
                        window.removeEventListener('mousemove', handleResize);
                        window.removeEventListener('mouseup', stopResize);
                      };
                      window.addEventListener('mousemove', handleResize);
                      window.addEventListener('mouseup', stopResize);
                    }}
                  />
                  {/* Delete Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}
                    className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 z-50"
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LifeBalancePage = ({ data, setData, theme, isGuest, t }) => {
  const [activeDimension, setActiveDimension] = useState(data.appSettings.dimensionConfig?.[0]?.name || "Health");
  const [activeLibTab, setActiveLibTab] = useState("challenges");
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState(null);
  const [editFreq, setEditFreq] = useState(null);
  const [isEditingDims, setIsEditingDims] = useState(false);
  const colors = THEMES[theme];

  // Ensure dimensions exist in settings
  useEffect(() => {
    if (!data.appSettings.dimensionConfig) {
      setData(prev => ({
        ...prev,
        appSettings: { ...prev.appSettings, dimensionConfig: DEFAULT_DIMENSIONS }
      }));
    }
  }, []);

  const dimensions = data.appSettings.dimensionConfig || DEFAULT_DIMENSIONS;
  const accountCreationDate = data.appSettings?.accountCreationDate;

  const calculatedDimensions = useMemo(() => {
    return dimensions.map(dim => {
      const dimData = data.dimensions[dim.name];
      const score = calculateDimensionScore(dimData, accountCreationDate);
      return { ...dim, score };
    });
  }, [data.dimensions, dimensions, accountCreationDate]);

  const overallScore = useMemo(() => {
    const totalWeight = dimensions.reduce((acc, dim) => acc + (dim.weight || 0), 0);
    if (totalWeight === 0) return 0;
    const weightedSum = calculatedDimensions.reduce((acc, dim) => acc + (dim.score * (dim.weight || 0)), 0);
    return Math.round(weightedSum / totalWeight);
  }, [calculatedDimensions, dimensions]);

  const chartData = calculatedDimensions.map(dim => ({ subject: t(dim.name.toLowerCase()) || dim.name, A: dim.score, fullMark: 100 }));
  const currentDimData = data.dimensions[activeDimension] || {};

  const addItem = (type, val, freq = 'daily') => {
    if (!val) return;
    const newItem = {
      id: Date.now(),
      name: val,
      status: 0,
      importance: 'Medium',
      skills: [],
      roleKey: '',
      dueDate: '',
      frequency: freq, // Store frequency in item
      completionHistory: []
    };

    setData(prev => {
      const dimData = prev.dimensions[activeDimension];
      const updatedList = type === 'routine'
        ? { ...dimData.routines, [freq]: [...(dimData.routines[freq] || []), newItem] }
        : [...dimData[type], newItem];

      return {
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [activeDimension]: {
            ...dimData,
            [type === 'routine' ? 'routines' : type]: updatedList
          }
        }
      };
    });
    // Auto-open modal
    setEditingItem(newItem);
    setEditType(type === 'routine' ? 'routines' : type);
    if (type === 'routine') setEditFreq(freq);
  };

  const saveItem = (updatedItem) => {
    setData(prev => {
      const dimData = prev.dimensions[activeDimension];
      let updatedField;

      if (editType === 'routines') {
        const newFreq = updatedItem.frequency || editFreq;

        // If frequency changed, move it
        if (newFreq !== editFreq) {
          // Remove from old
          const oldList = dimData.routines[editFreq].filter(i => i.id !== updatedItem.id);
          // Add to new
          const newList = [...(dimData.routines[newFreq] || []), updatedItem];

          updatedField = {
            ...dimData.routines,
            [editFreq]: oldList,
            [newFreq]: newList
          };
        } else {
          // Update in place
          const list = dimData.routines[editFreq].map(i => i.id === updatedItem.id ? updatedItem : i);
          updatedField = { ...dimData.routines, [editFreq]: list };
        }
      } else {
        updatedField = dimData[editType].map(i => i.id === updatedItem.id ? updatedItem : i);
      }
      return { ...prev, dimensions: { ...prev.dimensions, [activeDimension]: { ...dimData, [editType === 'routines' ? 'routines' : editType]: updatedField } } };
    });
    setEditingItem(null);
  };

  const removeItem = (type, id, freq = 'daily') => {
    setData(prev => {
      const dimData = prev.dimensions[activeDimension];
      let updated;
      if (type === 'routines') updated = { ...dimData.routines, [freq]: dimData.routines[freq].filter(i => i.id !== id) };
      else updated = dimData[type].filter(i => i.id !== id);
      return { ...prev, dimensions: { ...prev.dimensions, [activeDimension]: { ...dimData, [type]: updated } } };
    });
  };

  const toggleItemStatus = (e, item, type, freq) => {
    e.stopPropagation();

    let updatedItem;

    if (type === 'routines') {
      const today = new Date().toISOString().split('T')[0];
      const history = item.completionHistory || [];
      const alreadyDone = history.includes(today);

      let newHistory;
      if (alreadyDone) {
        newHistory = history.filter(d => d !== today);
      } else {
        newHistory = [...history, today];
      }
      // Status 100 if done today, 0 otherwise (visual only, score is calculated from history)
      updatedItem = { ...item, completionHistory: newHistory, status: alreadyDone ? 0 : 100 };
    } else {
      const newStatus = item.status === 100 ? 0 : 100;
      updatedItem = { ...item, status: newStatus };
    }

    setData(prev => {
      const dimData = prev.dimensions[activeDimension];
      let updatedField;
      if (type === 'routines') {
        const list = dimData.routines[freq].map(i => i.id === item.id ? updatedItem : i);
        updatedField = { ...dimData.routines, [freq]: list };
      } else {
        // For other types, we might want different logic, but for now this is mainly for routines
        updatedField = dimData[type].map(i => i.id === item.id ? updatedItem : i);
      }
      return { ...prev, dimensions: { ...prev.dimensions, [activeDimension]: { ...dimData, [type === 'routines' ? 'routines' : type]: updatedField } } };
    });
  };

  const LibraryItemCard = ({ item, onDelete, onClick, onEdit, type, freq }) => (
    <div onClick={onClick} className={`${colors.bgSecondary} p-4 rounded-xl mb-3 border ${colors.border} hover:${colors.emphasisBorder} transition-all cursor-pointer group relative shadow-sm hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className={`font-bold ${colors.text} pr-16 text-lg`}>{item.name}</h4>
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className={`p-1.5 ${colors.bgQuaternary} rounded hover:bg-blue-500 hover:text-white text-gray-400 transition-colors`}><Edit size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className={`p-1.5 ${colors.bgQuaternary} rounded hover:bg-red-500 hover:text-white text-gray-400 transition-colors`}><Trash2 size={14} /></button>
        </div>
      </div>
      <div className={`flex items-center gap-3 text-xs mb-4`}>
        <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider text-[10px] ${colors.bgQuaternary} ${colors.text} flex items-center gap-1`}>
          {getImportanceConfig(item.importance).icon} {item.importance || 'Medium'}
        </span>
        {item.dueDate && <span className="flex items-center gap-1 text-gray-400"><Calendar size={12} /> {item.dueDate}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex-1 h-2 ${colors.bgQuaternary} rounded-full overflow-hidden relative`}>
          <div className={`h-full rounded-full ${getScoreColor(item.status || 0).bg}`} style={{ width: `${item.status || 0}%` }}></div>
        </div>
        {type === 'routines' && (
          <button
            onClick={(e) => toggleItemStatus(e, item, type, freq)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.status === 100 ? 'bg-green-500 border-green-500' : `border-gray-500 hover:border-green-500`}`}
          >
            {item.status === 100 && <Check size={14} className="text-white" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex h-full ${colors.bg} overflow-hidden`}>
      <ItemDetailModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} item={editingItem} type={editType} roles={data.appSettings.userRoles} skills={data.skills} data={data} onSave={saveItem} theme={theme} isGuest={isGuest} t={t} />

      {/* Edit Dimensions Modal */}
      <Modal isOpen={isEditingDims} onClose={() => setIsEditingDims(false)} title={t('editDimensions')} theme={theme}>
        <div className="space-y-4">
          <p className={`text-sm ${colors.textSecondary}`}>{t('editDimensionsDesc')}</p>
          {dimensions.map((dim, idx) => (
            <div key={idx} className={`flex gap-2 items-center ${colors.bgSecondary} p-2 rounded`}>
              <input
                value={dim.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setData(prev => {
                    const newDims = [...prev.appSettings.dimensionConfig];
                    newDims[idx] = { ...newDims[idx], name: newName };
                    const oldName = dim.name;
                    const newDimensionsData = { ...prev.dimensions };
                    if (oldName !== newName && newDimensionsData[oldName]) {
                      newDimensionsData[newName] = newDimensionsData[oldName];
                      delete newDimensionsData[oldName];
                    }
                    return { ...prev, appSettings: { ...prev.appSettings, dimensionConfig: newDims }, dimensions: newDimensionsData };
                  });
                }}
                className={`flex-1 ${colors.input} border ${colors.border} rounded px-2 py-1 text-sm`}
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{t('weight')}:</span>
                <input
                  type="number"
                  value={dim.weight || 0}
                  onChange={(e) => {
                    const newWeight = parseInt(e.target.value) || 0;
                    setData(prev => {
                      const newDims = [...prev.appSettings.dimensionConfig];
                      newDims[idx] = { ...newDims[idx], weight: newWeight };
                      return { ...prev, appSettings: { ...prev.appSettings, dimensionConfig: newDims } };
                    });
                  }}
                  className={`w-16 ${colors.input} border ${colors.border} rounded px-2 py-1 text-sm text-right`}
                />
                <span className="text-xs">%</span>
                {dimensions.length > 3 && (
                  <button onClick={() => {
                    if (window.confirm(t('deleteDimensionConfirm'))) {
                      setData(prev => {
                        const newDims = prev.appSettings.dimensionConfig.filter((_, i) => i !== idx);
                        const newDimensionsData = { ...prev.dimensions };
                        delete newDimensionsData[dim.name];
                        return { ...prev, appSettings: { ...prev.appSettings, dimensionConfig: newDims }, dimensions: newDimensionsData };
                      });
                    }
                  }} className="text-gray-500 hover:text-red-500 ml-2"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}
          <div className={`flex justify-between items-center pt-4 border-t ${colors.border}`}>
            <button onClick={() => {
              const newName = `New Dimension ${dimensions.length + 1}`;
              setData(prev => ({
                ...prev,
                appSettings: { ...prev.appSettings, dimensionConfig: [...prev.appSettings.dimensionConfig, { key: newName.toLowerCase().replace(/\s/g, '_'), name: newName, weight: 0, color: '#999' }] },
                dimensions: { ...prev.dimensions, [newName]: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] } } }
              }));
            }} className={`px-4 py-2 ${colors.bgSecondary} border ${colors.border} rounded hover:${colors.bgQuaternary} ${colors.text} text-xs`}>
              <Plus size={14} className="inline mr-1" /> {t('add')}
            </button>

            <span className={`font-bold ${dimensions.reduce((a, b) => a + (b.weight || 0), 0) === 100 ? 'text-green-400' : 'text-orange-400'}`}>
              {t('totalWeight')}: {dimensions.reduce((a, b) => a + (b.weight || 0), 0)}%
            </span>
            <button onClick={() => setIsEditingDims(false)} className={`${colors.emphasisBg} text-black px-4 py-2 rounded`}>{t('done')}</button>
          </div>
        </div>
      </Modal>

      {/* Left Sidebar */}
      <div className={`w-80 p-6 border-r ${colors.border} overflow-y-auto custom-scrollbar flex flex-col ${colors.bgSecondary}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-xl font-bold ${colors.text}`}>{t('lifeBalance')}</h2>
          <button onClick={() => setIsEditingDims(true)} className={`p-2 hover:${colors.bgQuaternary} rounded ${colors.textSecondary} hover:${colors.text} transition-colors`}><Settings size={18} /></button>
        </div>

        {/* Overall Score Card */}
        {/* Overall Score Card */}
        {/* Overall Score Card */}
        <div className={`mb-8 p-5 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-between shadow-lg`}>
          <div>
            <div className={`text-[10px] ${getScoreColor(overallScore).color} font-bold uppercase tracking-widest mb-1`}>{t('overallScore')}</div>
            <div className={`text-4xl font-bold ${getScoreColor(overallScore).color}`}>{overallScore}%</div>
          </div>
          <div className={`h-14 w-14 rounded-full border-4 ${getScoreColor(overallScore).border} flex items-center justify-center text-sm font-bold ${colors.text} shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
            {overallScore}
          </div>
        </div>

        <div className="h-48 w-full mb-8 opacity-80 hover:opacity-100 transition-opacity"><ResponsiveContainer><RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}><PolarGrid stroke={theme === 'dark' ? "#333" : "#e5e7eb"} /><PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#666' : '#9ca3af', fontSize: 9 }} /><PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} /><Radar dataKey="A" stroke={getScoreColor(overallScore).hex} fill={getScoreColor(overallScore).hex} fillOpacity={0.5} /></RadarChart></ResponsiveContainer></div>

        <div className="space-y-4 flex-1">
          {calculatedDimensions.map(dim => (
            <div key={dim.key} onClick={() => setActiveDimension(dim.name)} className={`group cursor-pointer`}>
              <div className="flex justify-between items-end mb-1">
                <span className={`text-sm font-medium transition-colors ${activeDimension === dim.name ? colors.text : `${colors.textSecondary} group-hover:${colors.text}`}`}>{t(dim.name.toLowerCase()) || dim.name}</span>
                <span className={`text-xs font-bold ${activeDimension === dim.name ? colors.text : getScoreColor(dim.score).color}`}>{dim.score}%</span>
              </div>
              <div className={`w-full h-1.5 ${colors.bgQuaternary} rounded-full overflow-hidden`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${activeDimension === dim.name ? `${getScoreColor(dim.score).bg} shadow-[0_0_10px_rgba(255,255,255,0.3)]` : getScoreColor(dim.score).bg}`}
                  style={{ width: `${dim.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-8 flex flex-col ${colors.bg}`}>
        <h2 className={`text-3xl font-bold ${colors.text} mb-8`}>{t(activeDimension.toLowerCase()) || activeDimension}</h2>

        {/* Tabs */}
        <div className={`flex gap-4 mb-8`}>
          {[
            { id: 'challenges', color: 'red', label: t('challenges'), icon: <Swords size={16} /> },
            { id: 'goals', color: 'purple', label: t('goals'), icon: <Target size={16} /> },
            { id: 'projects', color: 'green', label: t('projects'), icon: <Rocket size={16} /> },
            { id: 'routines', color: 'yellow', label: t('routines'), icon: <Calendar size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveLibTab(tab.id)}
              className={`flex-1 py-4 rounded-xl border-2 transition-all duration-300 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 ${activeLibTab === tab.id
                ? `border-${tab.color}-500/50 bg-${tab.color}-900/10 ${colors.text} shadow-[0_0_20px_rgba(${tab.color === 'red' ? '239,68,68' : tab.color === 'purple' ? '168,85,247' : tab.color === 'green' ? '34,197,94' : '234,179,8'},0.15)]`
                : `border-${tab.color}-900/30 ${colors.bgSecondary} ${colors.textSecondary} hover:border-${tab.color}-800 hover:${colors.bgQuaternary}`
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {activeLibTab === 'routines' ? (
            ['daily', 'weekly', 'monthly'].map(freq => (
              <div key={freq} className="mb-8">
                <h4 className={`text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pl-1`}>{t(freq)}</h4>
                <div className="space-y-3">
                  {currentDimData.routines?.[freq]?.map(item => (
                    <LibraryItemCard
                      key={item.id}
                      item={item}
                      type="routines"
                      freq={freq}
                      onDelete={() => removeItem('routines', item.id, freq)}
                      onClick={() => { setEditingItem(item); setEditType('routines'); setEditFreq(freq); }}
                      onEdit={() => { setEditingItem(item); setEditType('routines'); setEditFreq(freq); }}
                    />
                  ))}
                </div>
                <div className="mt-3">
                  <AddItemInput onAdd={(v) => addItem('routine', v, freq)} placeholder={`${t('add')} ${t(freq)} ${t('routine')}...`} theme={theme} />
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {currentDimData[activeLibTab]?.map(item => (
                <LibraryItemCard
                  key={item.id}
                  item={item}
                  type={activeLibTab}
                  onDelete={() => removeItem(activeLibTab, item.id)}
                  onClick={() => { setEditingItem(item); setEditType(activeLibTab); }}
                  onEdit={() => { setEditingItem(item); setEditType(activeLibTab); }}
                />
              ))}
              <div className="mt-4">
                <AddItemInput onAdd={(v) => addItem(activeLibTab, v)} placeholder={`${t('add')} ${t(activeLibTab)}...`} theme={theme} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RolesPage = ({ data, setData, onSelectRole, theme, t }) => {
  const userRoles = data?.appSettings?.userRoles || [];
  const roleLibrary = data?.appSettings?.roleLibrary || [];
  const [showLibrary, setShowLibrary] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const colors = THEMES[theme] || THEMES.dark;

  // Show all roles in library, but mark which ones are active
  const availableRoles = roleLibrary || [];

  const toggleRole = (role, isAdding) => {
    setData(prev => {
      const currentRoles = prev.appSettings.userRoles || [];
      const newRoles = isAdding ? [...currentRoles, role] : currentRoles.filter(r => r.key !== role.key);
      return { ...prev, appSettings: { ...prev.appSettings, userRoles: newRoles } };
    });
  };

  const createCustomRole = () => {
    if (!newRoleName) return;

    if (editingRole) {
      // Update existing role
      const updatedRole = { ...editingRole, name: newRoleName };
      setData(prev => ({
        ...prev,
        appSettings: {
          ...prev.appSettings,
          userRoles: (prev.appSettings.userRoles || []).map(r => r.key === editingRole.key ? updatedRole : r),
          roleLibrary: (prev.appSettings.roleLibrary || []).map(r => r.key === editingRole.key ? updatedRole : r)
        }
      }));
      setEditingRole(null);
    } else {
      // Create new role
      const newRole = { key: newRoleName.toLowerCase().replace(/\s/g, '_'), name: newRoleName, icon: 'User', isCustom: true };
      setData(prev => ({
        ...prev,
        appSettings: {
          ...prev.appSettings,
          userRoles: [...(prev.appSettings.userRoles || []), newRole],
          roleLibrary: [...(prev.appSettings.roleLibrary || []), newRole]
        }
      }));
    }
    setNewRoleName("");
    setIsCreating(false);
  };

  const deleteCustomRole = (e, roleKey) => {
    e.stopPropagation();
    if (window.confirm(t('deleteRoleConfirm'))) {
      setData(prev => ({
        ...prev,
        appSettings: {
          ...prev.appSettings,
          userRoles: (prev.appSettings.userRoles || []).filter(r => r.key !== roleKey),
          roleLibrary: (prev.appSettings.roleLibrary || []).filter(r => r.key !== roleKey)
        }
      }));
    }
  };

  const openEditModal = (e, role) => {
    e.stopPropagation();
    setEditingRole(role);
    setNewRoleName(role.name);
    setIsCreating(true);
  };

  const handleDeleteRole = (e, roleKey) => {
    e.stopPropagation();
    if (window.confirm(t('deleteRoleConfirm'))) {
      const role = userRoles.find(r => r.key === roleKey);
      toggleRole(role, false);
    }
  };

  const getRoleIcon = (iconName, className) => {
    const iconClass = className || colors.emphasisText;
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell size={48} className={iconClass} />;
      case 'Briefcase': return <Briefcase size={48} className={iconClass} />;
      case 'User': return <User size={48} className={iconClass} />;
      case 'Heart': return <Heart size={48} className={iconClass} />;
      case 'Flag': return <Flag size={48} className={iconClass} />;
      case 'Users': return <Users size={48} className={iconClass} />;
      case 'GraduationCap': return <GraduationCap size={48} className={iconClass} />;
      default: return <User size={48} className={iconClass} />;
    }
  };

  const getSmallRoleIcon = (iconName) => {
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell size={20} />;
      case 'Briefcase': return <Briefcase size={20} />;
      case 'User': return <User size={20} />;
      case 'Heart': return <Heart size={20} />;
      case 'Flag': return <Flag size={20} />;
      case 'Users': return <Users size={20} />;
      case 'GraduationCap': return <GraduationCap size={20} />;
      default: return <User size={20} />;
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${colors.bg} p-8 custom-scrollbar flex flex-col`}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-3xl font-bold ${colors.text} flex items-center gap-3`}><User size={32} className={colors.emphasisText} /> {t('yourRoles')}</h2>
          <div className="flex gap-3">
            <button onClick={() => setShowLibrary(true)} className={`flex items-center gap-2 px-4 py-2 ${colors.bgSecondary} border ${colors.border} rounded-lg hover:${colors.emphasisBorder} transition-colors ${colors.text}`}>
              <BookOpen size={18} /> {t('roleLibrary')}
            </button>
            <button onClick={() => { setEditingRole(null); setNewRoleName(""); setIsCreating(true); }} className={`flex items-center gap-2 px-4 py-2 ${colors.emphasisBg} text-black rounded-lg hover:opacity-90 transition-colors`}>
              <Plus size={18} /> {t('createCustom')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRoles.map(role => (
            <div key={role.key} onClick={() => onSelectRole(role)} className={`h-64 relative p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-[#333] to-[#222]' : 'bg-gradient-to-br from-white to-gray-100'} border ${colors.border} rounded-2xl cursor-pointer hover:${colors.emphasisBorder} transition-all group flex flex-col justify-between overflow-hidden shadow-sm`}>
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={(e) => handleDeleteRole(e, role.key)} className="p-2 bg-black/50 hover:bg-red-600 rounded-lg text-white/70 hover:text-white transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="z-10 relative h-full flex flex-col">
                <div className={`mb-4 p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} rounded-2xl w-fit`}>
                  {getRoleIcon(role.icon)}
                </div>
                <div className="mt-auto">
                  <h3 className={`text-3xl font-bold ${colors.text} mb-2`}>{role.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 ${colors.emphasisBg} bg-opacity-20 ${colors.emphasisText} rounded-lg text-sm font-mono font-bold`}>{t('level1')}</span>
                    <span className={`${colors.textSecondary} text-sm font-mono`}>0 {t('xp')}</span>
                  </div>
                </div>
              </div>
              {/* Decorative background element */}
              <div className={`absolute -bottom-12 -right-12 w-48 h-48 ${colors.emphasisBg} opacity-10 rounded-full blur-3xl pointer-events-none`}></div>
            </div>
          ))}
          {userRoles.length === 0 && (
            <div className={`col-span-3 h-64 flex flex-col items-center justify-center border-2 border-dashed ${colors.border} rounded-2xl ${colors.textSecondary}`}>
              <p className="mb-4 text-lg">{t('noRolesAdded')}</p>
              <button onClick={() => setShowLibrary(true)} className={`${colors.emphasisText} hover:underline`}>{t('openLibrary')}</button>
            </div>
          )}
        </div>
      </div>

      {/* Library Modal */}
      <Modal isOpen={showLibrary} onClose={() => setShowLibrary(false)} title={t('roleLibraryTitle')} theme={theme}>
        <div className="space-y-2">
          {availableRoles.length === 0 ? (
            <p className={`${colors.textSecondary} text-center py-8`}>{t('noRolesAvailable')}</p>
          ) : (
            availableRoles.map(role => {
              const isActive = userRoles.find(r => r.key === role.key);
              return (
                <div key={role.key} className={`p-4 ${colors.bgSecondary} rounded-lg flex justify-between items-center border border-transparent hover:${colors.emphasisBorder} transition-all group`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${colors.bgQuaternary} rounded-lg flex items-center justify-center ${colors.textSecondary}`}>
                      {getSmallRoleIcon(role.icon)}
                    </div>
                    <span className={`font-bold text-lg ${colors.text}`}>{role.name}</span>
                    {isActive && <span className={`text-xs ${colors.emphasisText} bg-${colors.emphasis}-900/20 px-2 py-0.5 rounded`}>{t('active')}</span>}
                  </div>
                  <div className="flex gap-2">
                    {role.isCustom && (
                      <>
                        <button onClick={(e) => openEditModal(e, role)} className={`p-2 ${colors.textSecondary} hover:${colors.text} hover:bg-gray-700 rounded-lg`}><Edit size={18} /></button>
                        <button onClick={(e) => deleteCustomRole(e, role.key)} className={`p-2 ${colors.textSecondary} hover:text-red-400 hover:bg-gray-700 rounded-lg`}><Trash2 size={18} /></button>
                      </>
                    )}
                    {!isActive && (
                      <button onClick={() => toggleRole(role, true)} className={`${colors.emphasisBg} hover:opacity-90 text-black p-2 rounded-lg`}><Plus size={18} /></button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* Create/Edit Role Modal */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title={editingRole ? t('editRole') : t('createCustomRoleTitle')} theme={theme}>
        <div className="space-y-4">
          <div>
            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('roleName')}</label>
            <input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder={t('roleNamePlaceholder')}
              className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none focus:${colors.emphasisBorder}`}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsCreating(false)} className={`px-4 py-2 ${colors.textSecondary} hover:${colors.text}`}>{t('cancel')}</button>
            <button onClick={createCustomRole} className={`${colors.emphasisBg} hover:opacity-90 text-black px-6 py-2 rounded-lg font-medium`}>{editingRole ? t('saveChanges') : t('createRole')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const RoleDetailPage = ({ role, data, setData, onBack, theme, isGuest, t }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState(null);
  const colors = THEMES[theme];

  const roleItems = useMemo(() => {
    const items = { goals: [], projects: [], challenges: [], routines: [], skills: [], resources: [], wishlist: [] };
    Object.entries(data.dimensions).forEach(([dimKey, dim]) => {
      ['goals', 'projects', 'challenges'].forEach(type => { dim[type]?.forEach(i => { if (i.roleKey === role.key) items[type].push({ ...i, dimensionKey: dimKey }); }); });
      ['daily', 'weekly', 'monthly'].forEach(freq => { dim.routines?.[freq]?.forEach(i => { if (i.roleKey === role.key) items.routines.push({ ...i, freq, dimensionKey: dimKey }); }); });
    });
    items.skills = data.skills.filter(s => s.roleKey === role.key || s.source?.toLowerCase().includes(role.name.toLowerCase()));
    items.resources = data.resources.filter(r => r.roleKey === role.key);
    items.wishlist = data.wishlist.filter(r => r.roleKey === role.key);
    return items;
  }, [data, role]);

  const xp = calculateRoleXP(role.key, data);
  const level = Math.floor(xp / 100) + 1;

  const handleSaveItem = (updatedItem) => {
    if (editType === 'skills') {
      if (!data.skills.find(s => s.id === updatedItem.id)) {
        setData(prev => ({ ...prev, skills: [...prev.skills, updatedItem] }));
      } else {
        setData(prev => ({ ...prev, skills: prev.skills.map(s => s.id === updatedItem.id ? updatedItem : s) }));
      }
    } else if (editType === 'resources') {
      if (!data.resources.find(r => r.id === updatedItem.id)) {
        setData(prev => ({ ...prev, resources: [...prev.resources, updatedItem] }));
      } else {
        setData(prev => ({ ...prev, resources: prev.resources.map(r => r.id === updatedItem.id ? updatedItem : r) }));
      }
    } else if (editType === 'wishlist') {
      if (!data.wishlist.find(r => r.id === updatedItem.id)) {
        setData(prev => ({ ...prev, wishlist: [...prev.wishlist, updatedItem] }));
      } else {
        setData(prev => ({ ...prev, wishlist: prev.wishlist.map(r => r.id === updatedItem.id ? updatedItem : r) }));
      }
    } else if (['goals', 'projects', 'challenges', 'routines'].includes(editType)) {
      setData(prev => {
        const newData = { ...prev };
        const targetDimKey = updatedItem.dimensionKey || 'general';

        // Ensure target dimension exists
        if (!newData.dimensions[targetDimKey]) {
          newData.dimensions[targetDimKey] = { goals: [], projects: [], challenges: [], routines: { daily: [], weekly: [], monthly: [] } };
        }

        // Remove from old location if it exists (and if dimension changed)
        Object.keys(newData.dimensions).forEach(dimKey => {
          const dim = newData.dimensions[dimKey];
          if (editType === 'routines') {
            ['daily', 'weekly', 'monthly'].forEach(freq => {
              if (dim.routines?.[freq]) {
                dim.routines[freq] = dim.routines[freq].filter(i => i.id !== updatedItem.id);
              }
            });
          } else if (dim[editType]) {
            dim[editType] = dim[editType].filter(i => i.id !== updatedItem.id);
          }
        });

        // Add to new location
        const targetDim = newData.dimensions[targetDimKey];
        if (editType === 'routines') {
          const freq = updatedItem.freq || 'daily';
          if (!targetDim.routines) targetDim.routines = { daily: [], weekly: [], monthly: [] };
          if (!targetDim.routines[freq]) targetDim.routines[freq] = [];
          targetDim.routines[freq].push(updatedItem);
        } else {
          if (!targetDim[editType]) targetDim[editType] = [];
          targetDim[editType].push(updatedItem);
        }

        return newData;
      });
    }
    setEditingItem(null);
  };

  const createItem = (type) => {
    const baseItem = { id: Date.now(), name: '', roleKey: role.key };
    if (type === 'skills') baseItem.level = 0;
    if (type === 'resources' || type === 'wishlist') {
      baseItem.category = type === 'wishlist' ? 'wishlist' : 'electronics';
      baseItem.value = 0;
    }
    if (['goals', 'projects', 'challenges'].includes(type)) {
      baseItem.status = 0;
      baseItem.importance = 'Medium';
      baseItem.dimensionKey = ''; // User must select
    }
    if (type === 'routines') {
      baseItem.freq = 'daily';
      baseItem.dimensionKey = '';
    }
    setEditingItem(baseItem);
    setEditType(type);
  };

  const deleteItem = (type, id) => {
    if (!window.confirm(t('removeItemConfirm'))) return;
    if (type === 'skills') {
      setData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
    } else if (type === 'resources') {
      setData(prev => ({ ...prev, resources: prev.resources.filter(s => s.id !== id) }));
    } else if (type === 'wishlist') {
      setData(prev => ({ ...prev, wishlist: prev.wishlist.filter(s => s.id !== id) }));
    }
  };

  return (
    <div className={`h-full flex flex-col ${colors.bg}`}>
      <ItemDetailModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} item={editingItem} type={editType} roles={data.appSettings.userRoles} skills={data.skills} data={data} onSave={handleSaveItem} theme={theme} isGuest={isGuest} t={t} />

      <div className="h-48 bg-gradient-to-r from-blue-900 to-purple-900 p-8 flex items-end relative">
        <button onClick={onBack} className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-2"><ArrowLeft /> {t('backToRoles')}</button>
        <div className="flex items-center gap-6 w-full">
          <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-xl"><span className="text-4xl font-bold">{role.name[0]}</span></div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{role.name}</h1>
            <div className="flex items-center gap-4 text-sm text-blue-200 font-mono"><span className="bg-white/10 px-3 py-1 rounded">{t('level')} {level}</span><span>{xp} XP</span></div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Column 1: Active Missions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold ${colors.textSecondary} uppercase tracking-wider flex items-center gap-2`}><Rocket size={16} /> {t('activeMissions')}</h3>
              <div className="flex gap-2">
                <button onClick={() => createItem('challenges')} className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded hover:bg-red-900/50 transition-colors flex items-center gap-1"><Swords size={12} /> {t('challenge')}</button>
                <button onClick={() => createItem('goals')} className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded hover:bg-purple-900/50 transition-colors flex items-center gap-1"><Target size={12} /> {t('goal')}</button>
                <button onClick={() => createItem('projects')} className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded hover:bg-green-900/50 transition-colors flex items-center gap-1"><Rocket size={12} /> {t('project')}</button>
              </div>
            </div>
            <div className="space-y-3">
              {roleItems.goals.concat(roleItems.projects).concat(roleItems.challenges).map(item => (
                <div key={item.id} onClick={() => { setEditingItem(item); setEditType('goals'); }} className={`${colors.bgSecondary} p-4 rounded-xl border ${colors.border} hover:border-blue-500 cursor-pointer group`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${colors.text}`}>{item.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded bg-white/10 text-white flex items-center gap-1`}>
                      {getImportanceConfig(item.importance).icon} {item.importance}
                    </span>
                  </div>
                  <div className={`w-full h-1.5 ${colors.bgQuaternary} rounded-full overflow-hidden`}><div className={`h-full ${getScoreColor(item.status).bg}`} style={{ width: `${item.status}%` }}></div></div>
                </div>
              ))}
              {roleItems.goals.length === 0 && roleItems.projects.length === 0 && roleItems.challenges.length === 0 && <div className={`text-sm italic ${colors.textSecondary}`}>{t('noActiveMissions')}</div>}
            </div>
          </div>

          {/* Column 2: Mastery & Habits */}
          <div className="space-y-6">
            <h3 className={`text-lg font-bold ${colors.textSecondary} uppercase tracking-wider flex items-center gap-2`}><BookOpen size={16} /> {t('masteryHabits')}</h3>

            {/* Skills Section */}
            <div className={`${colors.bgTertiary} rounded-xl p-4 border ${colors.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h4 className={`text-sm font-bold ${colors.text}`}>{t('skills')}</h4>
                <button onClick={() => createItem('skills')} className="text-blue-400 hover:text-white text-xs flex items-center gap-1"><Plus size={12} /> {t('add')}</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {roleItems.skills.map(s => {
                  const dynamicLevel = calculateSkillLevel(s, data);
                  return (
                    <span key={s.id} onClick={() => { setEditingSkill(s); setEditType('skills'); }} className={`${colors.bgSecondary} border ${colors.border} px-3 py-1 rounded-full text-xs ${colors.textSecondary} flex items-center gap-2 cursor-pointer hover:border-blue-500 hover:${colors.text} group`}>
                      {s.name} <span className="text-blue-400">{dynamicLevel}%</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteItem('skills', s.id); }} className="hidden group-hover:block text-red-400"><X size={12} /></button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Routines Section */}
            <div className={`${colors.bgTertiary} rounded-xl p-4 border ${colors.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h4 className={`text-sm font-bold ${colors.text}`}>{t('routines')}</h4>
                <button onClick={() => createItem('routines')} className="text-blue-400 hover:text-white text-xs flex items-center gap-1"><Plus size={12} /> {t('add')}</button>
              </div>
              <div className="space-y-2">{roleItems.routines.map(r => <div key={r.id} className={`flex items-center justify-between text-sm ${colors.textSecondary} border-b ${colors.border} pb-2 last:border-0`}><span>{r.name}</span><span className={`text-xs ${colors.bgQuaternary} px-2 rounded text-blue-400 capitalize`}>{r.freq}</span></div>)}</div>
            </div>
          </div>

          {/* Column 3: Inventory & Needs */}
          <div className="space-y-6">
            <h3 className={`text-lg font-bold ${colors.textSecondary} uppercase tracking-wider flex items-center gap-2`}><Briefcase size={16} /> {t('roleResources')}</h3>

            {/* Have */}
            <div className={`${colors.bgSecondary} rounded-xl border ${colors.border} p-4`}>
              <div className={`flex justify-between items-center mb-3 border-b ${colors.border} pb-2`}>
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">{t('inventoryHave')}</h4>
                <button onClick={() => createItem('resources')} className={`${colors.bgQuaternary} hover:bg-gray-600 p-1 rounded text-white`}><Plus size={14} /></button>
              </div>
              <div className="space-y-3">
                {roleItems.resources.map(item => (
                  <div key={item.id} onClick={() => { setEditingItem(item); setEditType('resources'); }} className={`flex gap-3 items-center group cursor-pointer p-2 hover:${colors.bgQuaternary} rounded-lg transition-colors`}>
                    <div className={`w-10 h-10 ${colors.bgQuaternary} rounded flex-shrink-0 overflow-hidden`}>{item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${colors.textSecondary}`}><ImageIcon size={14} /></div>}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${colors.text} text-sm truncate`}>{item.name}</div>
                      <div className="font-mono text-emerald-400">${parseFloat(item.value).toLocaleString()}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem('resources', item.id); }} className={`text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100`}><Trash2 size={14} /></button>
                  </div>
                ))}
                {roleItems.resources.length === 0 && <div className={`text-xs ${colors.textSecondary} italic text-center py-2`}>{t('noResourcesLinked')}</div>}
              </div>
            </div>

            {/* Need */}
            <div className={`${colors.bgSecondary} rounded-xl border ${colors.border} p-4`}>
              <div className={`flex justify-between items-center mb-3 border-b ${colors.border} pb-2`}>
                <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wide">{t('needsWishlist')}</h4>
                <button onClick={() => createItem('wishlist')} className={`${colors.bgQuaternary} hover:bg-gray-600 p-1 rounded text-white`}><Plus size={14} /></button>
              </div>
              <div className="space-y-3">
                {roleItems.wishlist.map(item => (
                  <div key={item.id} onClick={() => { setEditingItem(item); setEditType('wishlist'); }} className={`flex gap-3 items-center group cursor-pointer p-2 hover:${colors.bgQuaternary} rounded-lg transition-colors`}>
                    <div className={`w-10 h-10 ${colors.bgQuaternary} rounded flex-shrink-0 overflow-hidden border border-yellow-400/20`}>{item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${colors.textSecondary}`}><Star size={14} className="text-yellow-400/50" /></div>}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${colors.text} text-sm truncate`}>{item.name}</div>
                      <div className="font-mono text-yellow-400">${parseFloat(item.value || 0).toLocaleString()}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem('wishlist', item.id); }} className={`text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100`}><Trash2 size={14} /></button>
                  </div>
                ))}
                {roleItems.wishlist.length === 0 && <div className={`text-xs ${colors.textSecondary} italic text-center py-2`}>{t('noItemsNeeded')}</div>}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const SkillsPage = ({ data, setData, theme, isGuest, t }) => {
  const [editingSkill, setEditingSkill] = useState(null);
  const [editType, setEditType] = useState(null);
  const colors = THEMES[theme];

  const deleteItem = (type, id) => {
    if (window.confirm(t('deleteSkillConfirm'))) {
      setData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
    }
  };

  const saveSkill = (updatedSkill) => {
    setData(prev => ({ ...prev, skills: prev.skills.map(s => s.id === updatedSkill.id ? updatedSkill : s) }));
    setEditingSkill(null);
  };

  const groupedSkills = data.skills.reduce((acc, skill) => {
    const role = data.appSettings.userRoles.find(r => r.key === skill.roleKey) || { name: t('general'), icon: 'User' };
    if (!acc[role.name]) acc[role.name] = { role, skills: [] };
    acc[role.name].skills.push(skill);
    return acc;
  }, {});

  return (
    <div className={`h-full flex flex-col ${colors.bg} p-6 overflow-hidden`}>
      <ItemDetailModal isOpen={!!editingSkill} onClose={() => setEditingSkill(null)} item={editingSkill} type="skills" roles={data.appSettings.userRoles} skills={data.skills} data={data} onSave={saveSkill} theme={theme} isGuest={isGuest} t={t} />

      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-bold ${colors.text} flex items-center gap-3`}><BookOpen size={32} className="text-blue-400" /> {t('lifeSkills')}</h2>
        <button onClick={() => { setEditingSkill({ id: Date.now(), name: '', level: 0, roleKey: '', source: 'Manual', manualMode: true }); setEditType('skills'); }} className={`flex items-center gap-2 px-4 py-2 ${colors.emphasisBg} text-black rounded-lg hover:opacity-90 transition-colors`}>
          <Plus size={18} /> {t('addSkill')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {Object.values(groupedSkills).map(roleItems => (
          <div key={roleItems.role.name} className={`p-6 rounded-2xl ${colors.bgSecondary} border ${colors.border}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${colors.bgQuaternary} text-blue-400`}>
                {/* Icon rendering logic would go here if needed, simplified for now */}
                <User size={20} />
              </div>
              <h3 className={`text-xl font-bold ${colors.text}`}>{roleItems.role.name}</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {roleItems.skills.map(s => {
                const dynamicLevel = calculateSkillLevel(s, data);
                return (
                  <span key={s.id} onClick={() => { setEditingSkill(s); setEditType('skills'); }} className={`${colors.bgSecondary} border ${colors.border} px-3 py-1 rounded-full text-xs ${colors.textSecondary} flex items-center gap-2 cursor-pointer hover:border-blue-500 hover:${colors.text} group`}>
                    {s.name} <span className="text-blue-400">{dynamicLevel}%</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem('skills', s.id); }} className="hidden group-hover:block text-red-400"><X size={12} /></button>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {data.skills.length === 0 && (
          <div className={`text-center py-12 ${colors.textSecondary} border-2 border-dashed ${colors.border} rounded-xl`}>
            <p>{t('noSkills')}</p>
            <p className="text-sm mt-1">{t('addSkillPrompt')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ResourcesPage = ({ data, setData, theme, isGuest, t }) => {
  const [activeCategory, setActiveCategory] = useState('money');
  const [editingItem, setEditingItem] = useState(null);
  const colors = THEMES[theme];

  const financials = useMemo(() => {
    const allResources = data.resources || [];
    const moneyItems = allResources.filter(r => r.category === 'money');
    const otherResources = allResources.filter(r => r.category !== 'money');

    // Assets: All physical resources + Investments
    const physicalAssets = otherResources.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
    const financialAssets = moneyItems.filter(i => i.moneyType === 'investment').reduce((sum, i) => sum + (Number(i.value) || 0), 0);

    // Liabilities: Debts
    const liabilities = moneyItems.filter(i => i.moneyType === 'debt').reduce((sum, i) => sum + (Number(i.value) || 0), 0);

    // Monthly Cashflow
    const income = moneyItems.filter(i => i.moneyType === 'income' && i.frequency === 'monthly').reduce((sum, i) => sum + (Number(i.value) || 0), 0);
    const expenses = moneyItems.filter(i => i.moneyType === 'expense' && i.frequency === 'monthly').reduce((sum, i) => sum + (Number(i.value) || 0), 0);

    return { netWorth: physicalAssets + financialAssets - liabilities, income, expenses, financialAssets, liabilities };
  }, [data.resources]);

  const handleSaveItem = (updatedItem) => {
    if (!data.resources.find(r => r.id === updatedItem.id)) {
      setData(prev => ({ ...prev, resources: [...prev.resources, updatedItem] }));
    } else {
      setData(prev => ({ ...prev, resources: prev.resources.map(r => r.id === updatedItem.id ? updatedItem : r) }));
    }
    setEditingItem(null);
  };

  const deleteResource = (id) => {
    if (window.confirm(t('deleteResourceConfirm'))) {
      setData(prev => ({ ...prev, resources: prev.resources.filter(r => r.id !== id) }));
    }
  };

  const createResource = (overrides = {}) => {
    setEditingItem({
      id: Date.now(),
      name: '',
      category: activeCategory,
      value: 0,
      image: null,
      condition: 'Good',
      description: '',
      ...overrides
    });
  };

  const MoneyItem = ({ item, dividedBy = 1 }) => (
    <div onClick={() => setEditingItem(item)} className={`flex justify-between items-center p-3 ${colors.bgQuaternary} rounded-lg border border-transparent hover:border-blue-500 cursor-pointer group transition-all mb-2`}>
      <span className={`font-medium ${colors.text}`}>{item.name}</span>
      <div className="flex items-center gap-3">
        <span className={`font-mono font-bold ${item.moneyType === 'income' || item.moneyType === 'investment' ? 'text-emerald-400' : 'text-red-400'}`}>
          {(Number(item.value) / dividedBy).toLocaleString()} COP
        </span>
        <button onClick={(e) => { e.stopPropagation(); deleteResource(item.id); }} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
      </div>
    </div>
  );

  const moneyItems = (data.resources || []).filter(r => r.category === 'money');
  const monthlyIncomes = moneyItems.filter(i => i.moneyType === 'income' && i.frequency === 'monthly');
  const monthlyExpenses = moneyItems.filter(i => i.moneyType === 'expense' && i.frequency === 'monthly');
  const investments = moneyItems.filter(i => i.moneyType === 'investment');
  const debts = moneyItems.filter(i => i.moneyType === 'debt');

  return (
    <div className={`h-full flex flex-col ${colors.bg} p-6 overflow-hidden`}>
      <ItemDetailModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        type="resources"
        roles={data.appSettings.userRoles}
        skills={data.skills}
        data={data}
        onSave={handleSaveItem}
        theme={theme}
        isGuest={isGuest}
        t={t}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-bold ${colors.text} flex items-center gap-3`}><Briefcase size={32} className="text-blue-400" /> {t('lifeResources')}</h2>
        {activeCategory !== 'money' && (
          <button onClick={() => createResource()} className={`flex items-center gap-2 px-4 py-2 ${colors.emphasisBg} text-black rounded-lg hover:opacity-90 transition-colors`}>
            <Plus size={18} /> {t('addResource')}
          </button>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${colors.bgSecondary} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textSecondary} uppercase`}>{t('netWorth')}</div>
          <div className={`text-2xl font-bold ${financials.netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>${financials.netWorth.toLocaleString()}</div>
        </div>
        <div className={`p-4 rounded-xl ${colors.bgSecondary} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textSecondary} uppercase`}>{t('monthlyIncome')}</div>
          <div className="text-2xl font-bold text-green-400">+${financials.income.toLocaleString()}</div>
        </div>
        <div className={`p-4 rounded-xl ${colors.bgSecondary} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textSecondary} uppercase`}>{t('monthlyExpenses')}</div>
          <div className="text-2xl font-bold text-red-400">-${financials.expenses.toLocaleString()}</div>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className={`flex gap-4 border-b ${colors.border} mb-6 overflow-x-auto pb-2 custom-scrollbar`}>
        {RESOURCE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${activeCategory === cat.id ? `${colors.emphasisBorder} ${colors.emphasisText}` : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            {React.cloneElement(cat.icon, { size: 18 })} {t(cat.id)}
          </button>
        ))}
      </div>

      {/* Money Section Content */}
      {activeCategory === 'money' ? (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8 content-start custom-scrollbar">

          {/* Left Column: Monthly & Weekly */}
          <div className="space-y-8">

            {/* Monthly Money */}
            <div>
              <div className="mb-4">
                <div className={`text-xs font-bold ${colors.textSecondary} uppercase`}>{t('moneyThisMonth')}</div>
                <div className={`text-3xl font-bold ${financials.income - financials.expenses >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {financials.income - financials.expenses > 0 ? '+' : ''}{(financials.income - financials.expenses).toLocaleString()} COP
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-lg font-bold ${colors.text} mb-3`}>{t('thisMonthIncomes')}</h4>
                  {monthlyIncomes.map(item => <MoneyItem key={item.id} item={item} />)}
                  <button onClick={() => createResource({ moneyType: 'income', frequency: 'monthly' })} className={`w-full py-2 mt-2 border border-dashed ${colors.border} rounded-lg text-sm ${colors.textSecondary} hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2`}>
                    <Plus size={14} /> {t('addMonthlyIncome')}
                  </button>
                </div>
                <div>
                  <h4 className={`text-lg font-bold ${colors.text} mb-3`}>{t('thisMonthExpenses')}</h4>
                  {monthlyExpenses.map(item => <MoneyItem key={item.id} item={item} />)}
                  <button onClick={() => createResource({ moneyType: 'expense', frequency: 'monthly' })} className={`w-full py-2 mt-2 border border-dashed ${colors.border} rounded-lg text-sm ${colors.textSecondary} hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2`}>
                    <Plus size={14} /> {t('addMonthlyExpense')}
                  </button>
                </div>
              </div>
            </div>

            {/* Weekly Money Section Removed */}


          </div>

          {/* Right Column: Investments & Debts */}
          <div className={`space-y-8 lg:border-l ${colors.border} lg:pl-8`}>

            {/* Investments */}
            <div>
              <div className={`text-xs font-bold ${colors.textSecondary} uppercase mb-1`}>{t('totalInvestedMoney')}</div>
              <div className={`text-3xl font-bold ${colors.text} mb-4`}>{financials.financialAssets.toLocaleString()} COP</div>

              <div className="space-y-2">
                {investments.length === 0 && (
                  <div className={`p-4 border ${colors.border} rounded-lg text-center ${colors.textSecondary}`}>{t('noInvestmentsYet')}</div>
                )}
                {investments.map(item => <MoneyItem key={item.id} item={item} />)}
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={() => createResource({ moneyType: 'investment' })} className={`flex items-center gap-2 ${colors.text} hover:${colors.emphasisText} transition-colors font-bold`}>
                  <Plus size={18} /> {t('addInvestment')}
                </button>
              </div>
            </div>

            {/* Debts */}
            <div>
              <div className={`text-xs font-bold ${colors.textSecondary} uppercase mb-1`}>{t('totalIndebtedMoney')}</div>
              <div className="text-3xl font-bold text-red-400 mb-4">-{financials.liabilities.toLocaleString()} COP</div>

              <div className="space-y-2">
                {debts.length === 0 && (
                  <div className={`p-4 border ${colors.border} rounded-lg text-center ${colors.textSecondary}`}>{t('noDebtsYet')}</div>
                )}
                {debts.map(item => <MoneyItem key={item.id} item={item} />)}
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={() => createResource({ moneyType: 'debt' })} className={`flex items-center gap-2 ${colors.text} hover:${colors.emphasisText} transition-colors font-bold`}>
                  <Plus size={18} /> {t('addDebt')}
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Standard Resource Grid for other categories */
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          {(data.resources || []).filter(r => r.category === activeCategory).map(item => (
            <div key={item.id} onClick={() => setEditingItem(item)} className={`p-4 rounded-xl ${colors.bgSecondary} border ${colors.border} hover:border-blue-500/50 group relative cursor-pointer transition-all`}>
              <button onClick={(e) => { e.stopPropagation(); deleteResource(item.id); }} className="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"><X size={14} /></button>

              <div className="flex gap-4">
                <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${colors.bgQuaternary} flex items-center justify-center`}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={RESOURCE_CATEGORIES.find(c => c.id === item.category)?.color || 'text-gray-400'}>
                      {React.cloneElement(RESOURCE_CATEGORIES.find(c => c.id === item.category)?.icon || <Briefcase />, { size: 24 })}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-bold ${colors.text} truncate mb-1`}>{item.name}</div>
                  <div className={`text-sm font-mono ${item.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${(item.value || 0).toLocaleString()}
                  </div>
                  {item.condition && <div className={`text-xs ${colors.textSecondary} mt-1`}>{t(item.condition.toLowerCase()) || item.condition}</div>}
                </div>
              </div>
            </div>
          ))}
          {(data.resources || []).filter(r => r.category === activeCategory).length === 0 && (
            <div className={`col-span-full text-center py-12 ${colors.textSecondary} border-2 border-dashed ${colors.border} rounded-xl`}>
              <p>{t('noResourcesLinked')}</p>
              <button onClick={() => createResource()} className="text-blue-400 hover:text-blue-300 text-sm mt-2">{t('addResource')}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TodayPage = ({ data, setData, theme, isGuest, t }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTask, setNewTask] = useState("");
  const colors = THEMES[theme];

  const addTask = (name) => {
    // Placeholder for adding a task - currently just logs or could be implemented to add to a default dimension
    console.log("Adding task:", name);
    // Logic to add a one-off task could go here, e.g., adding to a 'General' dimension or similar
  };

  // Helper for date ranges
  const getWeekBounds = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const checkWeekCompletion = (history, date) => {
    if (!history) return false;
    const { start, end } = getWeekBounds(date);
    return history.some(hDate => {
      const d = new Date(hDate);
      return d >= start && d <= end;
    });
  };

  const checkMonthCompletion = (history, date) => {
    if (!history) return false;
    const m = date.getMonth();
    const y = date.getFullYear();
    return history.some(hDate => {
      const d = new Date(hDate);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  };

  const { dailyItems, weeklyItems, monthlyItems } = useMemo(() => {
    const daily = [];
    const weekly = [];
    const monthly = [];
    const dateStr = selectedDate.toISOString().split('T')[0];

    Object.entries(data.dimensions || {}).forEach(([dimKey, dim]) => {
      if (!dim) return;
      // Daily Routines
      dim.routines?.daily?.forEach(r => {
        if (!r) return;
        const isCompleted = (r.completionHistory || []).includes(dateStr);
        daily.push({
          ...r,
          type: 'Routine',
          source: 'Daily',
          dimKey: dimKey,
          category: 'routines',
          subCategory: 'daily',
          isCompleted: isCompleted,
          status: isCompleted ? 100 : 0
        });
      });

      // Weekly Routines
      dim.routines?.weekly?.forEach(r => {
        if (!r) return;
        const isCompleted = checkWeekCompletion(r.completionHistory, selectedDate);
        weekly.push({
          ...r,
          type: 'Routine',
          source: 'Weekly',
          dimKey: dimKey,
          category: 'routines',
          subCategory: 'weekly',
          isCompleted: isCompleted,
          status: isCompleted ? 100 : 0
        });
      });

      // Monthly Routines
      dim.routines?.monthly?.forEach(r => {
        if (!r) return;
        const isCompleted = checkMonthCompletion(r.completionHistory, selectedDate);
        monthly.push({
          ...r,
          type: 'Routine',
          source: 'Monthly',
          dimKey: dimKey,
          category: 'routines',
          subCategory: 'monthly',
          isCompleted: isCompleted,
          status: isCompleted ? 100 : 0
        });
      });

      // Process One-off Items
      ['goals', 'projects', 'challenges'].forEach(cat => {
        dim[cat]?.forEach(item => {
          if (!item) return;
          if (item.dueDate === dateStr) daily.push({
            ...item,
            type: cat.slice(0, -1),
            source: 'Due',
            dimKey: dimKey,
            category: cat,
            isCompleted: item.status === 100
          });
        });
      });
    });
    return { dailyItems: daily, weeklyItems: weekly, monthlyItems: monthly };
  }, [data, selectedDate]);

  // Calculate Adherence for Today, Week, Month
  const adherenceData = useMemo(() => {
    // All Daily Routines defined in the system (not just for today)
    let allDailyRoutines = [];
    Object.values(data.dimensions || {}).forEach(dim => {
      if (dim && dim.routines?.daily) allDailyRoutines = [...allDailyRoutines, ...dim.routines.daily];
    });

    const totalRoutines = allDailyRoutines.length;
    if (totalRoutines === 0) return { today: 0, week: 0, month: 0 };

    // 1. Today
    const dateStr = selectedDate.toISOString().split('T')[0];
    const completedToday = allDailyRoutines.filter(r => (r.completionHistory || []).includes(dateStr)).length;
    const todayPct = Math.round((completedToday / totalRoutines) * 100);

    // 2. This Week (Sunday to Saturday of selectedDate)
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Go to Sunday

    let weeklyCompletions = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      weeklyCompletions += allDailyRoutines.filter(r => (r.completionHistory || []).includes(dStr)).length;
    }
    const weekPct = Math.round((weeklyCompletions / (totalRoutines * 7)) * 100);

    // 3. This Month
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

    let monthlyCompletions = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i);
      const dStr = d.toISOString().split('T')[0];
      monthlyCompletions += allDailyRoutines.filter(r => (r.completionHistory || []).includes(dStr)).length;
    }
    const monthPct = Math.round((monthlyCompletions / (totalRoutines * daysInMonth)) * 100);

    return { today: todayPct, week: weekPct, month: monthPct };
  }, [data, selectedDate]);

  const toggleComplete = (item) => {
    setData(prev => {
      const newData = { ...prev };
      const dim = newData.dimensions[item.dimKey];
      if (!dim) return prev; // Safety check
      const dateStr = selectedDate.toISOString().split('T')[0];
      const accountCreationDate = newData.appSettings?.accountCreationDate ? new Date(newData.appSettings.accountCreationDate) : new Date(0);
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      accountCreationDate.setHours(0, 0, 0, 0);

      if (selectedDateObj < accountCreationDate) {
        alert("You cannot modify routines before your account creation date.");
        return prev;
      }

      if (item.category === 'routines') {
        const routines = dim.routines[item.subCategory];
        const targetRoutine = routines.find(r => r.id === item.id);

        if (targetRoutine) {
          let history = targetRoutine.completionHistory || [];

          if (item.subCategory === 'daily') {
            if (history.includes(dateStr)) {
              history = history.filter(h => h !== dateStr);
              targetRoutine.completionHistory = history; // Fix: Update history in object
              targetRoutine.status = 0;
            } else {
              history.push(dateStr);
              targetRoutine.status = 100;
            }
          } else if (item.subCategory === 'weekly') {
            const { start, end } = getWeekBounds(selectedDate);
            // Remove any completion in this week range if exists
            const hasCompletion = history.some(hDate => {
              const d = new Date(hDate);
              return d < start || d > end;
            });

            if (hasCompletion) {
              // Remove all completions for this week
              history = history.filter(hDate => {
                const d = new Date(hDate);
                return d < start || d > end;
              });
              targetRoutine.completionHistory = history; // Fix: Update history in object
              targetRoutine.status = 0;
            } else {
              // Add today as the completion date for this week
              history.push(dateStr);
              targetRoutine.status = 100;
            }
          } else if (item.subCategory === 'monthly') {
            const m = selectedDate.getMonth();
            const y = selectedDate.getFullYear();
            // Remove any completion in this month if exists
            const hasCompletion = history.some(hDate => {
              const d = new Date(hDate);
              return d.getMonth() === m && d.getFullYear() === y;
            });

            if (hasCompletion) {
              history = history.filter(hDate => {
                const d = new Date(hDate);
                return d.getMonth() !== m || d.getFullYear() !== y;
              });
              targetRoutine.completionHistory = history; // Fix: Update history in object
              targetRoutine.status = 0;
            } else {
              history.push(dateStr);
              targetRoutine.status = 100;
            }
          }

          targetRoutine.completionHistory = history;
        }
      } else {
        // Handle standard one-off items
        const targetList = dim[item.category];
        const targetItem = targetList.find(i => i.id === item.id);
        if (targetItem) {
          targetItem.status = targetItem.status === 100 ? 0 : 100;
        }
      }

      return newData;
    });
  };

  const AdherenceBar = ({ label, pct, color }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className={`${colors.textSecondary} font-medium`}>{label}</span>
        <span className={`font-bold ${color}`}>{pct}%</span>
      </div>
      <div className={`w-full h-1.5 ${colors.bgQuaternary} rounded-full overflow-hidden`}>
        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-gray-600'}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );

  const TaskItem = ({ item }) => (
    <div className={`${colors.bgSecondary} p-4 rounded-xl border ${colors.border} flex items-center gap-4 group hover:border-gray-600 transition-all`}>
      <div
        onClick={() => toggleComplete(item)}
        className={`w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-200 ${item.isCompleted ? 'bg-green-500 border-green-500 scale-110' : `border-gray-600 hover:border-green-500 hover:bg-green-500/10`}`}
      >
        {item.isCompleted && <Check size={14} className="text-black font-bold" />}
      </div>
      <div className="flex-1">
        <div className={`font-medium ${colors.text} transition-all ${item.isCompleted ? `line-through ${colors.textSecondary}` : ''}`}>{item.name}</div>
        <div className={`text-xs ${colors.textSecondary} flex gap-2 mt-1`}>
          <span className={`${colors.bgQuaternary} px-2 py-0.5 rounded text-blue-300`}>{item.type}</span>
          {item.source === 'Due' && <span className="text-orange-400">{t('dueToday')}</span>}
          {item.subCategory === 'weekly' && <span className="text-purple-400">{t('weeklyGoal')}</span>}
          {item.subCategory === 'monthly' && <span className="text-indigo-400">{t('monthlyGoal')}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-full p-6 overflow-y-auto custom-scrollbar ${colors.bg} flex gap-6`}>
      <div className="w-80 flex-shrink-0">
        <h2 className={`text-3xl font-bold ${colors.text} flex items-center gap-3 mb-6`}><Calendar size={32} className="text-blue-400" /> {t('myTime')}</h2>
        <div className={`${colors.bgSecondary} p-4 rounded-xl border ${colors.border}`}>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setSelectedDate(prev => { const d = new Date(prev); d.setMonth(prev.getMonth() - 1); return d; })} className={`p-1 hover:${colors.bgQuaternary} rounded`}><ChevronRight className="rotate-180" /></button>
            <h3 className={`font-bold ${colors.text}`}>{selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => setSelectedDate(prev => { const d = new Date(prev); d.setMonth(prev.getMonth() + 1); return d; })} className={`p-1 hover:${colors.bgQuaternary} rounded`}><ChevronRight /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className={`${colors.textSecondary} py-1`}>{d}</div>)}
            {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(d => (
              <div key={d} onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d))} className={`py-2 rounded cursor-pointer hover:${colors.bgQuaternary} ${d === selectedDate.getDate() ? `${colors.emphasisBg} text-black font-bold` : colors.textSecondary}`}>{d}</div>
            ))}
          </div>
        </div>
      </div>



      <div className={`flex-1 h-full flex flex-col ${colors.bg} p-6 overflow-hidden`}>
        <div className="flex justify-end items-center mb-6 h-[88px] flex-col justify-center"> {/* Match height of left header roughly or align center */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() - 1); return d; })} className={`p-2 rounded-lg ${colors.bgSecondary} hover:${colors.bgQuaternary} ${colors.text}`}><ChevronLeft size={20} /></button>
            <div className={`text-lg font-bold ${colors.text} w-32 text-center`}>{selectedDate.toLocaleDateString()}</div>
            <button onClick={() => setSelectedDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() + 1); return d; })} className={`p-2 rounded-lg ${colors.bgSecondary} hover:${colors.bgQuaternary} ${colors.text}`}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Section */}
          <div className={`p-6 rounded-2xl ${colors.bgSecondary} border ${colors.border}`}>
            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">{t('focusToday')}</h3>
            <div className="space-y-3">
              {dailyItems.map((item, idx) => <TaskItem key={`d-${idx}`} item={item} />)}
              {dailyItems.length === 0 && <div className={`flex flex-col items-center justify-center h-32 ${colors.textSecondary} border-2 border-dashed ${colors.border} rounded-xl`}><Smile size={32} className="mb-2 opacity-20" /><p>{t('noDailyTasks')}</p></div>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <AddItemInput onAdd={addTask} placeholder={`${t('addTask')}...`} theme={theme} />
            </div>
          </div>

          {/* Weekly Section */}
          <div className={`p-6 rounded-2xl ${colors.bgSecondary} border ${colors.border}`}>
            <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">{t('focusWeek')}</h3>
            <div className="space-y-3">
              {weeklyItems.map((item, idx) => <TaskItem key={`w-${idx}`} item={item} />)}
              {weeklyItems.length === 0 && <div className={`text-sm italic ${colors.textSecondary}`}>{t('noWeeklyRoutines')}</div>}
            </div>
          </div>

          {/* Monthly Section */}
          <div className={`p-6 rounded-2xl ${colors.bgSecondary} border ${colors.border}`}>
            <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">{t('focusMonth')}</h3>
            <div className="space-y-3">
              {monthlyItems.map((item, idx) => <TaskItem key={`m-${idx}`} item={item} />)}
              {monthlyItems.length === 0 && <div className={`text-sm italic ${colors.textSecondary}`}>{t('noMonthlyRoutines')}</div>}
            </div>
          </div>
        </div>
      </div>
    </div >

  );
};

const SupportPage = ({ theme, t }) => {
  const colors = THEMES[theme];

  return (
    <div className={`h-full flex flex-col items-center justify-center ${colors.bg} p-6 overflow-y-auto`}>
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-xl mb-4 overflow-hidden z-10">
            <img src={logoFull} alt="Livia" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-2xl font-bold text-white z-10">Livia - Self Coaching</h1>
          <p className="text-purple-100 text-sm z-10">@livia_app</p>
        </div>

        {/* Content Card */}
        <div className={`${colors.bgSecondary} rounded-b-3xl shadow-2xl p-8 border-x border-b ${colors.border} -mt-4 pt-8 relative z-0`}>
          <p className={`text-center ${colors.text} mb-8 leading-relaxed`}>
            {t('supportStory')}
          </p>

          <div className="space-y-4">
            <a
              href="https://paypal.me/juanjhoy"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold py-3 px-4 rounded-full text-center transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <DollarSign size={20} /> {t('donatePaypal')}
            </a>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className={`p-4 rounded-xl ${colors.bgQuaternary} flex flex-col items-center gap-2 border ${colors.border}`}>
                <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black text-xs font-bold text-center p-2">Bancolombia QR Placeholder</span>
                </div>
                <span className={`text-xs font-bold ${colors.textSecondary}`}>{t('scanBancolombia')}</span>
              </div>
              <div className={`p-4 rounded-xl ${colors.bgQuaternary} flex flex-col items-center gap-2 border ${colors.border}`}>
                <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black text-xs font-bold text-center p-2">Nequi QR Placeholder</span>
                </div>
                <span className={`text-xs font-bold ${colors.textSecondary}`}>{t('scanNequi')}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            {/* Social placeholders */}
            <button className={`p-2 rounded-full ${colors.bgQuaternary} ${colors.textSecondary} hover:text-blue-500 transition-colors`}><Globe size={20} /></button>
            <button className={`p-2 rounded-full ${colors.bgQuaternary} ${colors.textSecondary} hover:text-blue-400 transition-colors`}><Mail size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Layout ---

export default function LiviaApp() {
  const [isGuest, setIsGuest] = useState(false);
  const { currentUser, logout } = useAuth();

  // Initialize data state
  const [data, setData] = useState(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Translation Helper
  const t = (key) => {
    const lang = data.appSettings.language || 'en';
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  // Load data from Firestore or LocalStorage
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoaded(false); // Prevent saving while loading

      if (currentUser) {
        console.log("Loading data for user:", currentUser.uid);
        // Load from Firestore
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const loadedData = docSnap.data();

            // Merge with DEFAULT_DATA to ensure all fields exist
            const mergedData = {
              ...JSON.parse(JSON.stringify(DEFAULT_DATA)),
              ...loadedData,
              appSettings: {
                ...DEFAULT_DATA.appSettings,
                ...loadedData.appSettings,
                // Ensure hasSeenTour is preserved if it exists, otherwise default to false
                hasSeenTour: loadedData.appSettings?.hasSeenTour ?? false
              },
              // Merge other nested objects if necessary, or trust top-level override
              dimensions: loadedData.dimensions || DEFAULT_DATA.dimensions,
              resources: loadedData.resources || DEFAULT_DATA.resources,
              skills: loadedData.skills || DEFAULT_DATA.skills,
              wishlist: loadedData.wishlist || DEFAULT_DATA.wishlist,
              visualizationImages: loadedData.visualizationImages || DEFAULT_DATA.visualizationImages,
            };

            // Ensure accountCreationDate exists (metadata)
            if (!mergedData.appSettings.accountCreationDate) {
              mergedData.appSettings.accountCreationDate = new Date().toISOString();
              await setDoc(docRef, mergedData);
            }
            // Force browser language
            mergedData.appSettings.language = getBrowserLanguage();
            setData(mergedData);
            console.log("Data loaded from Firestore (Merged)");
          } else {
            // New user, save default data
            console.log("New user, creating default data");
            const initialData = JSON.parse(JSON.stringify(DEFAULT_DATA));
            initialData.appSettings.accountCreationDate = new Date().toISOString();
            // Force browser language
            initialData.appSettings.language = getBrowserLanguage();
            await setDoc(docRef, initialData);
            setData(initialData);
          }
        } catch (error) {
          console.error("Error loading data from Firestore:", error);
        }
      } else if (isGuest) {
        // Load from LocalStorage (Guest Mode)
        const saved = localStorage.getItem('livia_data_v8');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const mergedData = {
              ...JSON.parse(JSON.stringify(DEFAULT_DATA)),
              ...parsed,
              appSettings: {
                ...DEFAULT_DATA.appSettings,
                ...parsed.appSettings,
                hasSeenTour: parsed.appSettings?.hasSeenTour ?? false
              },
              resources: parsed.resources || DEFAULT_DATA.resources,
              skills: parsed.skills || DEFAULT_DATA.skills,
              wishlist: parsed.wishlist || DEFAULT_DATA.wishlist,
              visualizationImages: parsed.visualizationImages || DEFAULT_DATA.visualizationImages,
              dimensions: parsed.dimensions || DEFAULT_DATA.dimensions
            };

            // Ensure accountCreationDate exists (metadata)
            if (!mergedData.appSettings.accountCreationDate) {
              mergedData.appSettings.accountCreationDate = new Date().toISOString();
              localStorage.setItem('livia_data_v8', JSON.stringify(mergedData));
            }

            // Force browser language
            mergedData.appSettings.language = getBrowserLanguage();

            setData(mergedData);

            if (shouldSave) {
              localStorage.setItem('livia_data_v8', JSON.stringify(mergedData));
            }
          } catch (e) {
            console.error("Error parsing saved data:", e);
            setData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
          }
        } else {
          setData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
        }
      } else {
        // Logged out - reset to defaults
        console.log("User logged out, resetting data");
        setData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
      }

      setIsDataLoaded(true); // Enable saving
    };

    loadData();
  }, [currentUser, isGuest]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Check for tour
  useEffect(() => {
    if (isDataLoaded && !data.appSettings.hasSeenTour) {
      // Small delay to ensure UI is rendered
      setTimeout(() => setShowTour(true), 1000);
    }
  }, [isDataLoaded, data.appSettings.hasSeenTour]);

  const handleTourComplete = async () => {
    setShowTour(false);
    const newData = {
      ...data,
      appSettings: { ...data.appSettings, hasSeenTour: true }
    };
    setData(newData);

    // Persist immediately
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid), newData);
      } catch (e) {
        console.error("Error saving tour status:", e);
      }
    } else if (isGuest) {
      localStorage.setItem('livia_data_v8', JSON.stringify(newData));
    }
  };

  const tourSteps = [
    { targetId: 'nav-visualization', title: t('visualization'), description: "Create your vision board. Upload images, resize them, and visualize your dreams in an infinite canvas." },
    { targetId: 'nav-dashboard', title: t('lifeBalance'), description: "Track your progress across 8 Life Dimensions. Manage challenges, goals, projects, and routines." },
    { targetId: 'nav-roles', title: t('lifeRoles'), description: "Define who you want to be. Create roles (e.g., 'Athlete', 'Creator') and link them to your activities." },
    { targetId: 'nav-skills', title: t('lifeSkills'), description: "Gamify your growth. Add skills and level them up automatically as you complete related tasks." },
    { targetId: 'nav-resources', title: t('lifeResources'), description: "Manage your inventory. Track money, assets, and wishlist items to support your journey." },
    { targetId: 'nav-time', title: t('myTime'), description: "Plan your day. View your daily, weekly, and monthly focus tasks in one place." },
    { targetId: 'nav-ai-coach', title: "AI Coach", description: "Need help? Click here to let our AI analyze your goals and generate a personalized plan for you." },
  ];

  const generatePillarData = async (pillarName, userInput) => {
    if (!userInput || userInput.trim().length < 5) return null;

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an expert life coach. The user has the following goals/challenges for their "${pillarName}" life pillar: "${userInput}".
        
        Based on this, generate a JSON object with the following structure:
        {
          "challenges": [{ "name": "Challenge Name", "importance": "High/Medium/Low", "status": 0 }],
          "goals": [{ "name": "Goal Name", "importance": "High/Medium/Low", "status": 0 }],
          "routines": {
            "daily": [{ "name": "Daily Routine Name", "importance": "High/Medium/Low", "status": 0 }],
            "weekly": [{ "name": "Weekly Routine Name", "importance": "High/Medium/Low", "status": 0 }],
            "monthly": [{ "name": "Monthly Routine Name", "importance": "High/Medium/Low", "status": 0 }]
          }
        }
        
        Generate 1-2 items for each category that are specific, actionable, and directly address the user's input.
        Return ONLY the JSON object, no markdown formatting.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Clean up markdown if present
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error(`Error generating data for ${pillarName}:`, error);
      return null;
    }
  };

  const handleOnboardingComplete = async (inputs) => {
    const newData = { ...data };

    // Process each pillar
    for (const [key, value] of Object.entries(inputs)) {
      if (!value) continue;

      // Map key to dimension name (e.g., 'health' -> 'Health')
      const dimConfig = newData.appSettings.dimensionConfig.find(d => d.key === key);
      if (!dimConfig) continue;
      const dimName = dimConfig.name;

      // Generate AI data
      const aiData = await generatePillarData(dimName, value);

      if (aiData) {
        // Merge into dimensions
        if (!newData.dimensions[dimName]) {
          newData.dimensions[dimName] = { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] } };
        }

        const dim = newData.dimensions[dimName];

        // Add IDs and merge
        if (aiData.challenges) dim.challenges.push(...aiData.challenges.map(i => ({ ...i, id: Date.now() + Math.random() })));
        if (aiData.goals) dim.goals.push(...aiData.goals.map(i => ({ ...i, id: Date.now() + Math.random() })));

        if (aiData.routines) {
          if (aiData.routines.daily) dim.routines.daily.push(...aiData.routines.daily.map(i => ({ ...i, id: Date.now() + Math.random() })));
          if (aiData.routines.weekly) dim.routines.weekly.push(...aiData.routines.weekly.map(i => ({ ...i, id: Date.now() + Math.random() })));
          if (aiData.routines.monthly) dim.routines.monthly.push(...aiData.routines.monthly.map(i => ({ ...i, id: Date.now() + Math.random() })));
        }
      }
    }

    newData.appSettings.hasCompletedOnboarding = true;
    setData(newData);
    setShowOnboarding(false);

    // Save immediately
    if (currentUser) {
      await setDoc(doc(db, "users", currentUser.uid), newData);
    } else if (isGuest) {
      localStorage.setItem('livia_data_v8', JSON.stringify(newData));
    }
  };

  // Save data to Firestore or LocalStorage
  useEffect(() => {
    if (!isDataLoaded) return;

    const saveData = async () => {
      if (currentUser) {
        console.log("Attempting to save data to Firestore for user:", currentUser.uid);
        try {
          await setDoc(doc(db, "users", currentUser.uid), data);
          console.log("Data saved successfully to Firestore!");
        } catch (error) {
          console.error("Error saving data to Firestore:", error);
        }
      } else if (isGuest) {
        console.log("Saving data to LocalStorage (Guest Mode)");
        localStorage.setItem('livia_data_v8', JSON.stringify(data));
      } else {
        console.log("No user logged in and not guest mode. Not saving.");
      }
    };

    // Debounce save? For now, just save on change (might be frequent)
    // In production, use a debounce hook
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [data, currentUser, isGuest, isDataLoaded]);

  // Derived state for theme
  const theme = data.appSettings.theme || 'dark';
  const colors = THEMES[theme];

  const handleGuest = () => {
    setData(JSON.parse(JSON.stringify(DEFAULT_DATA))); // Deep copy to reset
    setIsGuest(true);
  };



  if (!currentUser && !isGuest) {
    return <LandingPage onGuest={handleGuest} t={t} theme={theme} />;
  }

  const handleRoleSelect = (role) => { setSelectedRole(role); setActiveTab('role_detail'); };

  return (
    <div className={`flex h-screen w-screen ${colors.bg} ${colors.text} font-sans overflow-hidden transition-colors duration-300`}>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAI={() => setShowOnboarding(true)}
        data={data}
        theme={theme}
        isGuest={isGuest}
        t={t}
      />

      <TourGuide
        steps={tourSteps}
        isOpen={showTour}
        onComplete={handleTourComplete}
        theme={theme}
      />

      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          theme={theme}
          t={t}
          logo={logoFull}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        data={data}
        setData={setData}
        t={t}
        isGuest={isGuest}
      />

      <main className="flex-1 flex flex-col h-full relative min-w-0">
        <header className={`h-14 border-b ${colors.border} flex items-center justify-between px-6 ${colors.bgSecondary}`}>
          <h1 className={`font-bold capitalize ${colors.text} flex items-center gap-2`}>Livia / {t(activeTab) || activeTab.replace('_', ' ')}</h1>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full overflow-hidden border ${colors.border}`}>
              {data.appSettings.userAvatar ? <img src={data.appSettings.userAvatar} className="w-full h-full object-cover" /> : <div className={`w-full h-full ${colors.bgQuaternary} flex items-center justify-center text-xs font-bold`}>{data.appSettings.userName[0]}</div>}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'visualization' && <VisualizationPage images={data.visualizationImages} setImages={(val) => setData(prev => ({ ...prev, visualizationImages: typeof val === 'function' ? val(prev.visualizationImages) : val }))} theme={theme} isGuest={isGuest} dimensions={data.appSettings.dimensionConfig || DIMENSIONS} t={t} />}
          {activeTab === 'dashboard' && <LifeBalancePage data={data} setData={setData} theme={theme} isGuest={isGuest} t={t} />}
          {activeTab === 'roles' && <RolesPage data={data} setData={setData} onSelectRole={handleRoleSelect} theme={theme} t={t} />}
          {/* Placeholder for others to save space, logic exists in memory if needed */}
          {activeTab === 'resources' && <ResourcesPage data={data} setData={setData} theme={theme} isGuest={isGuest} t={t} />}
          {activeTab === 'skills' && <SkillsPage data={data} setData={setData} theme={theme} isGuest={isGuest} t={t} />}
          {activeTab === 'my_time' && <TodayPage data={data} setData={setData} theme={theme} isGuest={isGuest} t={t} />}
          {activeTab === 'support' && <SupportPage theme={theme} t={t} />}

          {activeTab === 'role_detail' && selectedRole && (
            <RoleDetailPage role={selectedRole} data={data} setData={setData} onBack={() => setActiveTab('roles')} theme={theme} isGuest={isGuest} t={t} />
          )}
        </div>
      </main>
    </div>
  );
}
