import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, User, Settings, Download, Upload, Plus, X,
  Search, Globe, Smile, Meh, Frown, Image as ImageIcon,
  Rocket, Calendar, BookOpen, Briefcase, Star, Menu,
  ChevronRight, Check, MoreHorizontal, Trash2, Edit2, Filter,
  ArrowLeft, DollarSign, Users, PenTool, Link as LinkIcon,
  Clock, AlertCircle, Save, Home, Car, Music, Monitor,
  Dumbbell, Shirt, Sofa, Wallet, TrendingUp, TrendingDown,
  Activity, Heart, Cloud, Compass, Crown, Disc, Eye, Flag,
  GraduationCap, HandHeart, Layers, Leaf, Lightbulb,
  Palette, Plane, Shield, Utensils, Video, Wind, Camera, Tag,
  Baby, PieChart, BarChart3, LogOut, Moon, Sun, Globe2, Mail, Lock,
  UserX, Wrench, Zap, ChevronLeft, Swords, Target, ChevronsUp, ChevronsDown, Minus
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip
} from 'recharts';
import logo from './assets/logo.png';
import logoText from './assets/logo_text.png';
import logoFull from './assets/logo_full.png';

// --- Constants & Configuration ---

// CLOUDINARY CONFIGURATION
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

const DIMENSIONS = [
  { key: "health", name: "Health", max: 50, color: "#4caf50" },
  { key: "family", name: "Family", max: 12, color: "#2196f3" },
  { key: "freedom", name: "Freedom", max: 5, color: "#00bcd4" },
  { key: "community", name: "Community", max: 8, color: "#9c27b0" },
  { key: "management", name: "Management", max: 10, color: "#ff9800" },
  { key: "learning", name: "Learning", max: 5, color: "#795548" },
  { key: "creation", name: "Creation", max: 5, color: "#e91e63" },
  { key: "fun", name: "Fun", max: 5, color: "#ffeb3b" }
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

  DIMENSIONS.forEach(d => {
    dims[d.name] = { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] } };
  });

  // 1. Health
  dims["Health"].challenges.push(
    { id: 101, name: "Leave vices", status: 0, importance: "High", roleKey: "health_enthusiast", dueDate: "" },
    { id: 102, name: "Sleep well", status: 0, importance: "High", roleKey: "health_enthusiast", dueDate: "" },
    { id: 103, name: "Good posture", status: 0, importance: "Medium", roleKey: "health_enthusiast", dueDate: "" }
  );
  dims["Health"].goals.push(
    { id: 104, name: "Have a healthy body", status: 0, importance: "High", roleKey: "health_enthusiast", dueDate: "" },
    { id: 105, name: "Have a healthy appeareance", status: 0, importance: "High", roleKey: "health_enthusiast", dueDate: "" },
    { id: 106, name: "Have good sleep habits", status: 0, importance: "High", roleKey: "health_enthusiast", dueDate: "" },
    { id: 107, name: "Exercise regularly", status: 0, importance: "High", roleKey: "health_enthusiast", dueDate: "" },
    { id: 108, name: "Take care of mental health", status: 0, importance: "High", roleKey: "health_enthusiast", dueDate: "" }
  );
  dims["Health"].routines.daily.push(
    { id: 113, name: "Deep sleep", status: 0, completionHistory: [], importance: "High", roleKey: "health_enthusiast" },
    { id: 110, name: "Yoga", status: 0, completionHistory: [], importance: "Medium", roleKey: "health_enthusiast" },
    { id: 111, name: "Meditation", status: 0, completionHistory: [], importance: "Medium", roleKey: "health_enthusiast" },
    { id: 112, name: "Skin care routine", status: 0, completionHistory: [], importance: "Medium", roleKey: "health_enthusiast" }
  );

  // 2. Family
  dims["Family"].challenges.push(
    { id: 201, name: "Have important uncomfortable conversations in family", status: 0, importance: "High", roleKey: "family_member", dueDate: "" }
  );
  dims["Family"].goals.push(
    { id: 202, name: "Take care of my family's health and mental health", status: 0, importance: "High", roleKey: "family_member", dueDate: "" },
    { id: 203, name: "Share time on family", status: 0, importance: "High", roleKey: "family_member", dueDate: "" },
    { id: 204, name: "Have fun experiences in family", status: 0, importance: "High", roleKey: "family_member", dueDate: "" }
  );
  dims["Family"].projects.push(
    { id: 205, name: "Family trip", status: 0, importance: "High", roleKey: "family_member", dueDate: "" }
  );

  // 3. Freedom
  dims["Freedom"].challenges.push(
    { id: 301, name: "Have free time", status: 0, importance: "High", roleKey: "free_spirit", dueDate: "" }
  );
  dims["Freedom"].goals.push(
    { id: 302, name: "Be able to manage my own time", status: 0, importance: "High", roleKey: "free_spirit", dueDate: "" }
  );

  // 4. Community
  dims["Community"].challenges.push(
    { id: 401, name: "Help the community", status: 0, importance: "High", roleKey: "community_member", dueDate: "" }
  );
  dims["Community"].goals.push(
    { id: 402, name: "Share time with close friends", status: 0, importance: "High", roleKey: "friend", dueDate: "" },
    { id: 403, name: "Volunteer", status: 0, importance: "Medium", roleKey: "volunteer", dueDate: "" }
  );

  // 5. Management
  dims["Management"].challenges.push(
    { id: 501, name: "Have a possitive account balance", status: 0, importance: "High", roleKey: "manager", dueDate: "" }
  );
  dims["Management"].goals.push(
    { id: 502, name: "Have a regular high income", status: 0, importance: "High", roleKey: "manager", dueDate: "" },
    { id: 503, name: "Pay debts", status: 0, importance: "High", roleKey: "manager", dueDate: "" },
    { id: 504, name: "Invest", status: 0, importance: "High", roleKey: "investor", dueDate: "" }
  );

  // 6. Learning
  dims["Learning"].challenges.push(
    { id: 601, name: "Learn to dance", status: 0, importance: "Medium", roleKey: "learner", dueDate: "" }
  );
  dims["Learning"].goals.push(
    { id: 602, name: "Learn a new language", status: 0, importance: "High", roleKey: "learner", dueDate: "" },
    { id: 603, name: "Learn a new recipe", status: 0, importance: "Medium", roleKey: "learner", dueDate: "" }
  );
  dims["Learning"].routines.daily.push(
    { id: 604, name: "Read daily", status: 0, completionHistory: [], importance: "High", roleKey: "learner" }
  );

  // 7. Creation
  dims["Creation"].challenges.push(
    { id: 701, name: "Find a creative hobbie", status: 0, importance: "Medium", roleKey: "creator", dueDate: "" }
  );
  dims["Creation"].goals.push(
    { id: 702, name: "Write on a journal", status: 0, importance: "High", roleKey: "creator", dueDate: "" }
  );

  // 8. Fun
  dims["Fun"].challenges.push(
    { id: 801, name: "Have autentic fun", status: 0, importance: "High", roleKey: "fun_seeker", dueDate: "" }
  );
  dims["Fun"].goals.push(
    { id: 802, name: "Know new places", status: 0, importance: "High", roleKey: "explorer", dueDate: "" },
    { id: 803, name: "Taste new foods", status: 0, importance: "Medium", roleKey: "foodie", dueDate: "" },
    { id: 804, name: "Hear new songs", status: 0, importance: "Medium", roleKey: "music_lover", dueDate: "" },
    { id: 805, name: "Play a fun game", status: 0, importance: "Medium", roleKey: "gamer", dueDate: "" }
  );

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
    frequency: "Frequency", monthly: "Monthly", oneTime: "One Time / Extra"
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
    frequency: "Frecuencia", monthly: "Mensual", oneTime: "Única Vez / Extra"

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
  skills: [
    { id: 101, name: "Running", level: 20, roleKey: "athlete", source: "Run a Marathon", manualMode: false },
    { id: 102, name: "Financial Planning", level: 45, roleKey: "entrepreneur", source: "Manual", manualMode: true },
    { id: 103, name: "Discipline", level: 10, roleKey: "athlete", source: "General", manualMode: false }
  ],
  resources: [],
  wishlist: [],
  visualizationImages: [],
  today: {
    date: new Date().toISOString().split('T')[0],
    tasks: []
  }
};

// --- Helper Functions ---

const calculateDimensionScore = (dimData) => {
  if (!dimData) return 0;
  let totalItems = 0;
  let totalScore = 0;
  const processList = (list) => {
    if (!list) return;
    list.forEach(item => { totalItems++; totalScore += (item.status || 0); });
  };
  processList(dimData.goals);
  processList(dimData.projects);
  processList(dimData.challenges);
  processList(dimData.routines?.daily);
  processList(dimData.routines?.weekly);
  processList(dimData.routines?.monthly);
  return totalItems === 0 ? 0 : Math.round(totalScore / totalItems);
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

  const checkItem = (item) => {
    if (!item) return;
    if (item.linkedSkillIds && Array.isArray(item.linkedSkillIds) && item.linkedSkillIds.includes(skill.id)) {
      totalStatus += (item.status || 0);
      count++;
    }
  };

  Object.values(allData.dimensions).forEach(dim => {
    if (!dim) return;
    dim.goals?.forEach(checkItem);
    dim.projects?.forEach(checkItem);
    dim.challenges?.forEach(checkItem);
    dim.routines?.daily?.forEach(checkItem);
    dim.routines?.weekly?.forEach(checkItem);
    dim.routines?.monthly?.forEach(checkItem);
  });

  if (count === 0) return skill.level || 0;
  return Math.round(totalStatus / count);
};

// --- Components ---

const LandingPage = ({ onLogin, onGuest, t, theme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ name: name || "User", email });
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
              <input type="number" className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.value || ''} onChange={e => handleChange('value', e.target.value)} placeholder="0.00" />
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

        {roles && !formData.roleKey && formData.category !== 'money' && (
          <div>
            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>Connected Role</label>
            <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.roleKey || ''} onChange={e => handleChange('roleKey', e.target.value)}>
              <option value="">-- No Role Linked --</option>
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
                <option value="">-- {t('select')} --</option>
                {allGoals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('connectedChallenge')}</label>
              <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.linkedChallengeId || ''} onChange={e => handleChange('linkedChallengeId', e.target.value)}>
                <option value="">-- {t('select')} --</option>
                {allChallenges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('connectedSkill')}</label>
              <select className={`w-full ${colors.input} border ${colors.border} rounded p-3 ${colors.text} focus:outline-none`} value={formData.linkedSkillId || ''} onChange={e => handleChange('linkedSkillId', e.target.value)}>
                <option value="">-- {t('select')} --</option>
                {skills && skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </Modal>
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

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onOpenSettings, data, theme, isGuest, t }) => {
  const menuItems = [
    { id: 'visualization', icon: <Rocket size={20} />, label: t('visualization') },
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t('lifeBalance') },
    { id: 'roles', icon: <User size={20} />, label: t('lifeRoles') },
    { id: 'skills', icon: <BookOpen size={20} />, label: t('lifeSkills') },
    { id: 'resources', icon: <Briefcase size={20} />, label: t('lifeResources') },
    { id: 'my_time', icon: <Calendar size={20} />, label: t('myTime') },
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
              <div className={`text-xs ${colors.textSecondary} truncate`}>{isGuest ? t('notSaving') : t('savingToLocal')}</div>
            </div>
          )}
        </div>
        {isGuest && isOpen && <div className="text-xs text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-700/50 flex items-center gap-1"><AlertCircle size={12} /> {t('guestMode')}</div>}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === item.id ? `${colors.emphasisBg} text-black shadow-lg` : `${colors.textSecondary} ${colors.sidebarHover} hover:${colors.text}`}`}
          >
            {item.icon}
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800/50 space-y-1">
        <button onClick={onOpenSettings} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${colors.textSecondary} ${colors.sidebarHover} hover:${colors.text} transition-colors`}>
          <Settings size={20} />
          {isOpen && <span className="text-sm font-medium">{t('settings')}</span>}
        </button>
        <button onClick={() => window.location.reload()} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors`}>
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
        x: (clientWidth / 2) - 2500, // 2500 is half of 5000 (canvas size)
        y: (clientHeight / 2) - 2500,
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
    const size = 5000;
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
        scale: 1, // Export at 1:1 scale of the container (which is huge, 5000x5000)
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
        <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', width: '5000px', height: '5000px' }} className={`relative ${theme === 'dark' ? 'bg-[radial-gradient(#333_1px,transparent_1px)]' : 'bg-[radial-gradient(#ccc_1px,transparent_1px)]'} bg-[length:50px_50px]`}>

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

  // Ensure dimensionConfig exists (migration for old data)
  const dimensions = data.appSettings.dimensionConfig || DIMENSIONS.map(d => ({ ...d, weight: 12.5 }));

  // ... calculations same as before ...
  const calculatedDimensions = useMemo(() => {
    return dimensions.map(dim => {
      const rawScore = calculateDimensionScore(data.dimensions[dim.name]);
      return { ...dim, score: rawScore };
    });
  }, [data.dimensions, dimensions]);

  const overallScore = useMemo(() => {
    const totalWeight = dimensions.reduce((acc, dim) => acc + (dim.weight || 0), 0);
    if (totalWeight === 0) return 0;
    const weightedSum = calculatedDimensions.reduce((acc, dim) => acc + (dim.score * (dim.weight || 0)), 0);
    return Math.round(weightedSum / totalWeight);
  }, [calculatedDimensions, dimensions]);

  const chartData = calculatedDimensions.map(dim => ({ subject: t(dim.name.toLowerCase()) || dim.name, A: dim.score, fullMark: 100 }));
  const currentDimData = data.dimensions[activeDimension] || {};

  const addItem = (type, val) => {
    if (!val) return;
    const newItem = { id: Date.now(), name: val, status: 0, importance: 'Medium', skills: [], roleKey: '', dueDate: '' };
    setData(prev => {
      const dimData = prev.dimensions[activeDimension];
      const updatedList = type === 'routine' ? { ...dimData.routines, daily: [...dimData.routines.daily, newItem] } : [...dimData[type], newItem];
      return { ...prev, dimensions: { ...prev.dimensions, [activeDimension]: { ...dimData, [type === 'routine' ? 'routines' : type]: updatedList } } };
    });
    // Auto-open modal
    setEditingItem(newItem);
    setEditType(type === 'routine' ? 'routines' : type);
    if (type === 'routine') setEditFreq('daily'); // Default to daily for quick add
  };

  const saveItem = (updatedItem) => {
    setData(prev => {
      const dimData = prev.dimensions[activeDimension];
      let updatedField;
      if (editType === 'routines') {
        const list = dimData.routines[editFreq].map(i => i.id === updatedItem.id ? updatedItem : i);
        updatedField = { ...dimData.routines, [editFreq]: list };
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

  const LibraryItemCard = ({ item, onDelete, onClick }) => (
    <div onClick={onClick} className={`${colors.bgSecondary} p-4 rounded-xl mb-3 border ${colors.border} hover:border-gray-500 transition-all cursor-pointer group relative shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className={`font-bold ${colors.text} pr-8 text-lg`}>{item.name}</h4>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className={`text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 absolute top-4 right-4 transition-opacity`}><Trash2 size={16} /></button>
      </div>
      <div className={`flex items-center gap-3 text-xs mb-4`}>
        <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider text-[10px] ${colors.bgQuaternary} ${colors.text} flex items-center gap-1`}>
          {getImportanceConfig(item.importance).icon} {item.importance || 'Medium'}
        </span>
        {item.dueDate && <span className="flex items-center gap-1 text-gray-400"><Calendar size={12} /> {item.dueDate}</span>}
      </div>
      <div className={`w-full h-2 ${colors.bgQuaternary} rounded-full overflow-hidden relative`}>
        <div className={`h-full rounded-full ${getScoreColor(item.status || 0).bg}`} style={{ width: `${item.status || 0}%` }}></div>
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
              </div>
            </div>
          ))}
          <div className={`flex justify-between items-center pt-4 border-t ${colors.border}`}>
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
                  className={`h-full rounded-full transition-all duration-500 ${activeDimension === dim.name ? `${colors.bg} shadow-[0_0_10px_rgba(255,255,255,0.3)]` : getScoreColor(dim.score).bg}`}
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
                    <LibraryItemCard key={item.id} item={item} onDelete={() => removeItem('routines', item.id, freq)} onClick={() => { setEditingItem(item); setEditType('routines'); setEditFreq(freq); }} />
                  ))}
                </div>
                <div className="mt-3">
                  <AddItemInput onAdd={(v) => addItem('routine', v)} placeholder={`${t('add')} ${t(freq)} ${t('routine')}...`} theme={theme} />
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {currentDimData[activeLibTab]?.map(item => (
                <LibraryItemCard key={item.id} item={item} onDelete={() => removeItem(activeLibTab, item.id)} onClick={() => { setEditingItem(item); setEditType(activeLibTab); }} />
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
  const { userRoles, roleLibrary } = data.appSettings;
  const [showLibrary, setShowLibrary] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const colors = THEMES[theme];

  const availableRoles = roleLibrary ? roleLibrary.filter(r => !userRoles.find(ur => ur.key === r.key)) : [];

  const toggleRole = (role, isAdding) => {
    setData(prev => {
      const newRoles = isAdding ? [...prev.appSettings.userRoles, role] : prev.appSettings.userRoles.filter(r => r.key !== role.key);
      return { ...prev, appSettings: { ...prev.appSettings, userRoles: newRoles } };
    });
  };

  const createCustomRole = () => {
    if (!newRoleName) return;
    const newRole = { key: newRoleName.toLowerCase().replace(/\s/g, '_'), name: newRoleName, icon: 'User' };
    setData(prev => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        userRoles: [...prev.appSettings.userRoles, newRole],
        roleLibrary: [...prev.appSettings.roleLibrary, newRole]
      }
    }));
    setNewRoleName("");
    setIsCreating(false);
  };

  const handleDeleteRole = (e, roleKey) => {
    e.stopPropagation();
    if (window.confirm(t('deleteRoleConfirm'))) {
      const role = userRoles.find(r => r.key === roleKey);
      toggleRole(role, false);
    }
  };

  const getRoleIcon = (iconName) => {
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell size={48} className="text-blue-400" />;
      case 'Briefcase': return <Briefcase size={48} className="text-blue-400" />;
      case 'User': return <User size={48} className="text-blue-400" />;
      case 'Heart': return <Heart size={48} className="text-blue-400" />;
      case 'Flag': return <Flag size={48} className="text-blue-400" />;
      case 'Users': return <Users size={48} className="text-blue-400" />;
      case 'GraduationCap': return <GraduationCap size={48} className="text-blue-400" />;
      default: return <User size={48} className="text-blue-400" />;
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
          <h2 className={`text-3xl font-bold ${colors.text} flex items-center gap-3`}><User size={32} className="text-blue-400" /> {t('yourRoles')}</h2>
          <div className="flex gap-3">
            <button onClick={() => setShowLibrary(true)} className={`flex items-center gap-2 px-4 py-2 ${colors.bgSecondary} border ${colors.border} rounded-lg hover:border-blue-500 transition-colors ${colors.text}`}>
              <BookOpen size={18} /> {t('roleLibrary')}
            </button>
            <button onClick={() => setIsCreating(true)} className={`flex items-center gap-2 px-4 py-2 ${colors.emphasisBg} text-black rounded-lg hover:opacity-90 transition-colors`}>
              <Plus size={18} /> {t('createCustom')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRoles.map(role => (
            <div key={role.key} onClick={() => onSelectRole(role)} className={`h-64 relative p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-[#333] to-[#222]' : 'bg-gradient-to-br from-white to-gray-100'} border ${colors.border} rounded-2xl cursor-pointer hover:border-blue-500 transition-all group flex flex-col justify-between overflow-hidden shadow-sm`}>
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
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-mono font-bold">{t('level1')}</span>
                    <span className={`${colors.textSecondary} text-sm font-mono`}>0 {t('xp')}</span>
                  </div>
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          ))}
          {userRoles.length === 0 && (
            <div className={`col-span-3 h-64 flex flex-col items-center justify-center border-2 border-dashed ${colors.border} rounded-2xl ${colors.textSecondary}`}>
              <p className="mb-4 text-lg">{t('noRolesAdded')}</p>
              <button onClick={() => setShowLibrary(true)} className="text-blue-400 hover:underline">{t('openLibrary')}</button>
            </div>
          )}
        </div>
      </div>

      {/* Library Modal */}
      <Modal isOpen={showLibrary} onClose={() => setShowLibrary(false)} title={t('roleLibraryTitle')} theme={theme}>
        <div className="space-y-2">
          {availableRoles.length === 0 ? (
            <p className={`${colors.textSecondary} text-center py-8`}>{t('allRolesActive')}</p>
          ) : (
            availableRoles.map(role => (
              <div key={role.key} onClick={() => toggleRole(role, true)} className={`p-4 ${colors.bgSecondary} rounded-lg flex justify-between items-center cursor-pointer hover:${colors.bgQuaternary} border border-transparent hover:border-blue-500/50 transition-all group`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${colors.bgQuaternary} rounded-lg flex items-center justify-center ${colors.textSecondary}`}>
                    {getSmallRoleIcon(role.icon)}
                  </div>
                  <span className={`font-bold text-lg ${colors.text}`}>{role.name}</span>
                </div>
                <button className={`${colors.emphasisBg} hover:opacity-90 text-black p-2 rounded-lg`}><Plus size={18} /></button>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Create Role Modal */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title={t('createCustomRoleTitle')} theme={theme}>
        <div className="space-y-4">
          <div>
            <label className={`block text-xs ${colors.textSecondary} uppercase font-bold mb-1`}>{t('roleName')}</label>
            <input
              className={`w-full ${colors.input} ${colors.text} px-4 py-3 rounded-lg border ${colors.border} focus:border-blue-500 outline-none`}
              placeholder={t('roleNamePlaceholder')}
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsCreating(false)} className={`px-4 py-2 ${colors.textSecondary} hover:${colors.text}`}>{t('cancel')}</button>
            <button onClick={createCustomRole} className={`${colors.emphasisBg} hover:opacity-90 text-black px-6 py-2 rounded-lg font-medium`}>{t('createRole')}</button>
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
              <div className="flex flex-wrap gap-2">
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

      if (item.category === 'routines') {
        const routines = dim.routines[item.subCategory];
        const targetRoutine = routines.find(r => r.id === item.id);

        if (targetRoutine) {
          let history = targetRoutine.completionHistory || [];

          if (item.subCategory === 'daily') {
            if (history.includes(dateStr)) {
              history = history.filter(h => h !== dateStr);
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
        <div className="flex justify-end items-center mb-6">
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
    </div>

  );
};

// --- Main App Layout ---

export default function LiviaApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('livia_data_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with DEFAULT_DATA to ensure new fields (like resources, skills) exist if missing in old data
        return {
          ...DEFAULT_DATA,
          ...parsed,
          appSettings: { ...DEFAULT_DATA.appSettings, ...parsed.appSettings },
          resources: parsed.resources || DEFAULT_DATA.resources,
          skills: parsed.skills || DEFAULT_DATA.skills,
          wishlist: parsed.wishlist || DEFAULT_DATA.wishlist,
          visualizationImages: parsed.visualizationImages || DEFAULT_DATA.visualizationImages,
          dimensions: parsed.dimensions || DEFAULT_DATA.dimensions
        };
      } catch (e) {
        console.error("Error parsing saved data:", e);
        return DEFAULT_DATA;
      }
    }
    return DEFAULT_DATA;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (!isGuest) {
      localStorage.setItem('livia_data_v8', JSON.stringify(data));
    }
  }, [data, isGuest]);

  // Derived state for theme
  const theme = data.appSettings.theme || 'dark';
  const colors = THEMES[theme];

  const handleLogin = (user) => {
    setData(prev => ({
      ...prev,
      appSettings: { ...prev.appSettings, userName: user.name, userEmail: user.email }
    }));
    setIsGuest(false);
    setIsAuthenticated(true);
  };

  const handleGuest = () => {
    setData(JSON.parse(JSON.stringify(DEFAULT_DATA))); // Deep copy to reset
    setIsGuest(true);
    setIsAuthenticated(true);
  };

  // Translation Helper
  const t = (key) => {
    const lang = data.appSettings.language || 'en';
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} onGuest={handleGuest} t={t} theme={theme} />;
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
        data={data}
        theme={theme}
        isGuest={isGuest}
        t={t}
      />

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

          {activeTab === 'role_detail' && selectedRole && (
            <RoleDetailPage role={selectedRole} data={data} setData={setData} onBack={() => setActiveTab('roles')} theme={theme} isGuest={isGuest} t={t} />
          )}
        </div>
      </main>
    </div>
  );
}
