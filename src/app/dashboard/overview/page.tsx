"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  MapPin,
  DollarSign,
  LineChart,
  RefreshCw,
  Search,
  Download,
  Info,
  Map,
  Home,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  Pie,
  PieChart as RechartsPieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import Saudation from "@/theme/dashboard/overview/saudation";

// Time period options
const TIME_PERIODS = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Esta Semana" },
  { value: "month", label: "Este Mês" },
  { value: "year", label: "Este Ano" },
];

// Sample data for charts
const serviceData = [
  { month: "Jan", services: 320, benefits: 83, lastYear: 280 },
  { month: "Fev", services: 280, benefits: 78, lastYear: 250 },
  { month: "Mar", services: 420, benefits: 95, lastYear: 310 },
  { month: "Abr", services: 380, benefits: 87, lastYear: 340 },
  { month: "Mai", services: 340, benefits: 72, lastYear: 280 },
  { month: "Jun", services: 290, benefits: 65, lastYear: 260 },
  { month: "Jul", services: 580, benefits: 120, lastYear: 390 },
  { month: "Ago", services: 390, benefits: 85, lastYear: 370 },
  { month: "Set", services: 290, benefits: 62, lastYear: 310 },
  { month: "Out", services: 430, benefits: 94, lastYear: 380 },
  { month: "Nov", services: 510, benefits: 110, lastYear: 460 },
  { month: "Dez", services: 470, benefits: 105, lastYear: 420 },
];

const serviceTypeData = [
  { name: "Acolhimento", value: 45, color: "#8b5cf6" },
  { name: "PAIF", value: 25, color: "#a78bfa" },
  { name: "Proteção Social", value: 20, color: "#c4b5fd" },
  { name: "Outros", value: 10, color: "#ddd6fe" },
];

const incomeData = [
  { name: "Extrema Pobreza", value: 240, color: "#ef4444" },
  { name: "Pobreza", value: 360, color: "#f97316" },
  { name: "Baixa Renda", value: 560, color: "#f59e0b" },
  { name: "Média Renda", value: 80, color: "#84cc16" },
  { name: "Alta Renda", value: 50, color: "#10b981" },
];

// Agenda items
const agendaItems = [
  {
    time: "9:00",
    title: "Reunião Plano mensal ações de junho",
    location: "CRAS - Pato Branco",
    type: "meeting",
  },
  {
    time: "13:30",
    title: "Visitar família Rosa 09123",
    location: "Rua João Gaudino, Bairro Renova, 32",
    type: "visit",
  },
  {
    time: "16:00",
    title: "Família Silva Rocha 09823",
    location: "Rua João Gaudino, Bairro Renova, 837",
    type: "visit",
  },
  {
    time: "16:30",
    title: "Família Barros 09842",
    location: "Rua João Gaudino, Bairro Renova, 733",
    type: "visit",
  },
  {
    time: "19:00",
    title: "Confraternização",
    location: "CRAS - Pato Branco",
    type: "event",
  },
];

// Stat Card Component
const StatCard = ({
  icon,
  title,
  value,
  change,
  period = "hoje",
  color = "bg-blue-500",
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  period?: string;
  color?: string;
  onClick?: () => void;
}) => {
  return (
    <Card
      className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`${color} text-white p-3 rounded-xl`}>{icon}</div>
          {change && (
            <span
              className={`text-xs font-medium ${
                change.startsWith("+") ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {change}
            </span>
          )}
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-baseline mt-1">
          <p className="text-2xl font-semibold">{value}</p>
          <span className="ml-2 text-xs text-gray-400">{period}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Action Button Component
const ActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <Button
      variant="outline"
      className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all group"
      onClick={onClick}
    >
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};

// Agenda Item Component
const AgendaItem = ({
  time,
  title,
  location,
  type,
}: {
  time: string;
  title: string;
  location: string;
  type: string;
}) => {
  const getTypeColor = () => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "visit":
        return "bg-emerald-100 text-emerald-800";
      case "event":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-md px-2 transition-colors">
      <div className="w-16 text-sm font-medium text-gray-900">{time}</div>
      <div className="ml-4 flex-1">
        <div className="font-medium text-gray-800">{title}</div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <MapPin className="h-3 w-3 mr-1" />
          {location}
        </div>
      </div>
      <div className="ml-2">
        <Badge variant="outline" className={`${getTypeColor()} border-0`}>
          {type === "meeting"
            ? "Reunião"
            : type === "visit"
            ? "Visita"
            : "Evento"}
        </Badge>
      </div>
    </div>
  );
};

// Improve Quick Actions - Remove Export Data option
const quickActions = [
  { icon: <Users className="h-5 w-5" />, label: "Novo Cadastro" },
  { icon: <LineChart className="h-5 w-5" />, label: "Indicadores" },
  { icon: <LineChart className="h-5 w-5" />, label: "Relatórios" },
  { icon: <MapPin className="h-5 w-5" />, label: "Mapa Social" },
];

// Main Dashboard Component
export default function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState("day");
  const [currentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Format date based on time period
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return currentDate.toLocaleDateString("pt-BR", options);
  };

  // Get stats based on time period
  const getStats = () => {
    switch (timePeriod) {
      case "day":
        return {
          services: "21",
          benefits: "8",
          families: "5",
          registrations: "12",
        };
      case "week":
        return {
          services: "98",
          benefits: "32",
          families: "24",
          registrations: "45",
        };
      case "month":
        return {
          services: "397",
          benefits: "83",
          families: "108",
          registrations: "199",
        };
      case "year":
        return {
          services: "4,582",
          benefits: "986",
          families: "512",
          registrations: "1,245",
        };
      default:
        return {
          services: "21",
          benefits: "8",
          families: "5",
          registrations: "12",
        };
    }
  };

  const stats = getStats();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6">
        {/* Dashboard Header */}
        <Saudation name="Filipe Reis" />
        {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Seja bem vindo(a) Filipe Reis
            </h1>
            <p className="text-gray-500 text-sm mt-1">Hoje é {formatDate()}</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px] h-9 bg-white">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div> */}

        {/* Main Content */}
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-[80vh]"
            >
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {quickActions.map((action, index) => (
                    <ActionButton
                      key={index}
                      icon={action.icon}
                      label={action.label}
                    />
                  ))}
                </div>
              </div>

              {/* Main Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Services Chart - Enhanced */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Evolução de Atendimentos
                        </h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80 text-xs">
                                Este gráfico mostra a evolução dos atendimentos
                                sociais e benefícios concedidos ao longo do
                                tempo. Compare com o ano anterior para analisar
                                tendências.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={serviceData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorServices"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorBenefits"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#f59e0b"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#f59e0b"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f3f4f6"
                          />
                          <XAxis
                            dataKey="month"
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            padding={{ left: 10, right: 10 }}
                          />
                          <YAxis
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            domain={[0, "dataMax + 100"]}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow:
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                              padding: "10px",
                            }}
                            formatter={(value, name) => {
                              if (name === "services")
                                return [
                                  `${value} atendimentos`,
                                  "Atendimentos",
                                ];
                              if (name === "benefits")
                                return [`${value} benefícios`, "Benefícios"];
                              if (name === "lastYear")
                                return [
                                  `${value} atendimentos`,
                                  "Ano Anterior",
                                ];
                              return [value, name];
                            }}
                            labelFormatter={(label) => `${label}/2023`}
                            animationDuration={300}
                          />
                          <Area
                            type="monotone"
                            dataKey="services"
                            name="Atendimentos"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorServices)"
                            activeDot={{
                              r: 8,
                              strokeWidth: 0,
                              fill: "#1d4ed8",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="benefits"
                            name="Benefícios"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBenefits)"
                            activeDot={{
                              r: 8,
                              strokeWidth: 0,
                              fill: "#d97706",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="lastYear"
                            name="Ano Anterior"
                            stroke="#9ca3af"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            iconSize={10}
                            formatter={(value) => {
                              return (
                                <span className="text-sm font-medium text-gray-700">
                                  {value}
                                </span>
                              );
                            }}
                            wrapperStyle={{ paddingBottom: "10px" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics - Replacing Agenda */}
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Indicadores Principais</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-violet-50 rounded-lg border border-violet-100 flex items-center">
                        <div className="bg-violet-100 p-3 rounded-full">
                          <Users className="h-6 w-6 text-violet-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm text-gray-500">
                            Beneficiários Registrados
                          </p>
                          <div className="flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-900">
                              {stats.registrations}
                            </p>
                            <span className="ml-2 text-xs text-gray-400 font-medium">
                              total
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm text-gray-500">
                            Atendimentos Sociais
                          </p>
                          <div className="flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-900">
                              {stats.services}
                            </p>
                            <span className="ml-2 text-xs text-emerald-500 font-medium">
                              +12%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center">
                        <div className="bg-emerald-100 p-3 rounded-full">
                          <Home className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm text-gray-500">
                            Famílias Cadastradas
                          </p>
                          <div className="flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-900">
                              {stats.families}
                            </p>
                            <span className="ml-2 text-xs text-gray-400 font-medium">
                              total
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Charts Section */}
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Indicadores Sociais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Service Distribution - Enhanced */}
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Distribuição por Serviço
                        </h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-60 text-xs">
                                Distribuição percentual dos tipos de serviços
                                prestados aos beneficiários.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={serviceTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {serviceTypeData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value, name) => [`${value}%`, name]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow:
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            }}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            iconSize={10}
                            formatter={(value) => {
                              return (
                                <span className="text-sm text-gray-700">
                                  {value}
                                </span>
                              );
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {serviceTypeData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-xs text-gray-600">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-xs font-medium">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Family Income - Enhanced */}
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Renda Familiar</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-60 text-xs">
                                Distribuição das famílias atendidas por faixa de
                                renda.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={incomeData}
                          layout="horizontal"
                          margin={{ top: 5, right: 20, bottom: 20, left: 20 }}
                          barSize={30}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={true}
                            horizontal={true}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            height={60}
                            tickMargin={10}
                          />
                          <YAxis
                            type="number"
                            domain={[0, 600]}
                            axisLine={true}
                            tickLine={true}
                          />
                          <RechartsTooltip
                            formatter={(value) => [`${value} famílias`]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow:
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {incomeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {incomeData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-xs text-gray-600">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-xs font-medium">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Combined Map Visualization */}
              <Card className="border-none shadow-sm mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        Mapa de Vulnerabilidade Social
                      </h3>

                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80 text-xs">
                            Mapa mostrando a concentração de famílias em
                            situação de vulnerabilidade social por bairro em
                            Maceió.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Map className="h-3 w-3 mr-1" />
                      Ver Mapa Completo
                    </Button>
                  </div>

                  <div className="h-[400px] w-full bg-gray-100 rounded-lg overflow-hidden relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31443.246799185436!2d-35.74826247749102!3d-9.594777391582744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x70146a7d9e3bc91%3A0x36bcdfacb3799888!2sBenedito%20Bentes%2C%20Macei%C3%B3%20-%20AL!5e0!3m2!1spt-BR!2sbr!4v1715715465372!5m2!1spt-BR!2sbr"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa de Vulnerabilidade Social"
                      className="w-full h-full"
                    />

                    {/* Legend overlay */}
                    <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
                      <h4 className="text-sm font-medium mb-2">Legenda</h4>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                          <span className="text-xs">Benedito Bentes (68)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                          <span className="text-xs">Graciliano Ramos (42)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                          <span className="text-xs">Antares (23)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-xs">Clima Bom (15)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                          <span className="text-xs">Outros (12)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <p className="text-xs text-gray-500">Benedito Bentes</p>
                      <p className="text-lg font-semibold text-red-600">68</p>
                      <p className="text-xs text-gray-400">famílias</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <p className="text-xs text-gray-500">Graciliano</p>
                      <p className="text-lg font-semibold text-orange-500">
                        42
                      </p>
                      <p className="text-xs text-gray-400">famílias</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <p className="text-xs text-gray-500">Antares</p>
                      <p className="text-lg font-semibold text-yellow-500">
                        23
                      </p>
                      <p className="text-xs text-gray-400">famílias</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <p className="text-xs text-gray-500">Clima Bom</p>
                      <p className="text-lg font-semibold text-blue-600">15</p>
                      <p className="text-xs text-gray-400">famílias</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <p className="text-xs text-gray-500">Outros</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        12
                      </p>
                      <p className="text-xs text-gray-400">famílias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
