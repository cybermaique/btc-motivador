import { useEffect, useMemo, useRef } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import "./index.css";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const MONTHLY_SAVINGS_BRL = 10000;
const DOLLAR_EXCHANGE_RATE = 5.8;
const BTC_BOTTOM_PRICE = 40000;
const BTC_TARGET_PRICE = 1000000;
const HOURS_PER_DAY = 8;
const DAYS_PER_MONTH = 22;
const HOURS_PER_MONTH = HOURS_PER_DAY * DAYS_PER_MONTH;
const BTC_MULTIPLIER = BTC_TARGET_PRICE / BTC_BOTTOM_PRICE;
const INITIAL_INVESTMENT_BRL = 120000;

const START_DATE = new Date("2025-03-25");
const BTC_BOTTOM_DATE = new Date("2026-10-17");
const TARGET_GOAL_BRL = 15000000;

const HOLIDAYS = [
  "2025-04-18",
  "2025-04-21",
  "2025-05-01",
  "2025-09-07",
  "2025-10-12",
  "2025-11-02",
  "2025-11-15",
  "2025-12-25",
  "2026-01-01",
  "2026-04-21",
  "2026-05-01",
  "2026-09-07",
  "2026-10-12",
  "2026-11-02",
  "2026-11-15",
  "2026-12-25",
];

function isHoliday(date: Date): boolean {
  const formatted = date.toISOString().split("T")[0];
  return HOLIDAYS.includes(formatted);
}

function getWorkingDaysBetweenDates(start: Date, end: Date): number {
  let totalDays = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (!isWeekend && !isHoliday(current)) totalDays++;
    current.setDate(current.getDate() + 1);
  }
  return totalDays;
}

function estimateCalendarDaysToReachGoal(
  startDate: Date,
  targetAmountBRL: number,
  currentAmountBRL: number,
  dailyRateBRL: number
): number {
  let projected = currentAmountBRL;
  let calendarDays = 0;
  const current = new Date(startDate);

  while (projected < targetAmountBRL) {
    const day = current.getDay();
    const isWeekend = day === 0 || day === 6;
    const isFeriado = isHoliday(current);

    if (!isWeekend && !isFeriado) {
      projected += dailyRateBRL;
    }

    calendarDays++;
    current.setDate(current.getDate() + 1);
  }

  return calendarDays;
}

export default function App() {
  const CURRENT_DATE = useMemo(() => new Date(), []);

  const totalWorkingDays = useMemo(
    () => getWorkingDaysBetweenDates(START_DATE, CURRENT_DATE),
    [CURRENT_DATE]
  );

  const dailySavings = MONTHLY_SAVINGS_BRL / DAYS_PER_MONTH;
  const now = new Date();
  const isWorkingDay =
    now.getDay() !== 0 && now.getDay() !== 6 && !isHoliday(now);

  let hoursWorkedToday = 0;
  if (isWorkingDay) {
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMinutes =
      Math.min(Math.max(hour - 8, 0), HOURS_PER_DAY) * 60 +
      (hour >= 8 && hour < 17 ? minute : 0);
    hoursWorkedToday = Math.min(totalMinutes / 60, HOURS_PER_DAY);
  }

  const totalHoursWorked = totalWorkingDays * HOURS_PER_DAY + hoursWorkedToday;
  const savedFromWorkBRL =
    (MONTHLY_SAVINGS_BRL / HOURS_PER_MONTH) * totalHoursWorked;
  const totalSavedBRL = savedFromWorkBRL + INITIAL_INVESTMENT_BRL;
  const totalProjectedBRL = totalSavedBRL * BTC_MULTIPLIER;

  const totalSavedUSD = totalSavedBRL / DOLLAR_EXCHANGE_RATE;
  const estimatedBTC = totalSavedUSD / BTC_BOTTOM_PRICE;

  const hourlyRate = (MONTHLY_SAVINGS_BRL * BTC_MULTIPLIER) / HOURS_PER_MONTH;
  const dailyRate = dailySavings * BTC_MULTIPLIER;

  const estimatedCalendarDaysToGoal = estimateCalendarDaysToReachGoal(
    CURRENT_DATE,
    TARGET_GOAL_BRL,
    totalProjectedBRL,
    dailyRate
  );

  // Para o gráfico de valores.
  const valueChartData = {
    labels: ["Conquistado", "Restante"],
    datasets: [
      {
        data: [totalProjectedBRL, TARGET_GOAL_BRL - totalProjectedBRL],
        backgroundColor: ["#4caf50", "#c8e6c9"],
        borderWidth: 1,
      },
    ],
  };

  // Para o gráfico de dias
  const passedDaysSinceStart = Math.ceil(
    (CURRENT_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  const remainingDaysToGoal = estimatedCalendarDaysToGoal;

  const daysChartData = {
    labels: ["Dias passados", "Dias restantes"],
    datasets: [
      {
        data: [passedDaysSinceStart, remainingDaysToGoal],
        backgroundColor: ["#2196f3", "#bbdefb"],
        borderWidth: 1,
      },
    ],
  };

  const daysUntilBottomBTC = Math.ceil(
    (BTC_BOTTOM_DATE.getTime() - CURRENT_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );

  const motivationalQuotes = [
    "Cada satoshi guardado é um passo mais perto da liberdade financeira.",
    "Disciplina hoje, liberdade financeira amanhã.",
    "Mantenha o foco, o seu futuro agradece!",
    "Pense a longo prazo e conquiste grandes objetivos.",
    "Você está plantando hoje para colher abundância no futuro.",
    "O dinheiro vem até mim em quantidades cada vez maiores, de diversas fontes e contínuas bases, e comigo fica para construção da minha riqueza.",
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/audio/pump.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
  }, []);

  return (
    <div className="container">
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.play().catch((e) => {
              console.log("Reprodução bloqueada:", e);
            });
          }
        }}
        style={{
          position: "absolute",
          top: "20px",
          left: "10px",
          zIndex: 9999,
          background: "transparent",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
        title="Tocar música"
      >
        🔊
      </button>

      <Typography variant="h5" className="motivational-quote-top" gutterBottom>
        {
          motivationalQuotes[
            Math.floor(Math.random() * motivationalQuotes.length)
          ]
        }
      </Typography>

      <Typography variant="h4" component="h1" gutterBottom>
        Rumo aos R$15.000.000
      </Typography>

      <Typography variant="h3" className="total-projection">
        Conquistado: R${" "}
        {totalProjectedBRL.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}
      </Typography>

      <Box display="flex" gap={5}>
        <Card className="card">
          <CardContent>
            <Typography variant="h6">Próximos Marcos</Typography>{" "}
            <p>
              Investimento inicial:{" "}
              <strong>R$ {INITIAL_INVESTMENT_BRL.toLocaleString()}</strong>
            </p>
            <p>
              Dias úteis trabalhados até hoje:{" "}
              <strong>{totalWorkingDays}</strong>
            </p>
            <p>
              BTC acumulado estimado:{" "}
              <strong>{estimatedBTC.toFixed(4)} BTC</strong>
            </p>
            <p>
              Dias corridos até o próximo fundo do BTC ($40.000):{" "}
              <strong>{daysUntilBottomBTC > 0 ? daysUntilBottomBTC : 0}</strong>
            </p>
            <p>
              Dias corridos estimados até R$15.000.000:{" "}
              <strong>{estimatedCalendarDaysToGoal}</strong>
            </p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progresso Financeiro
            </Typography>
            <Doughnut data={valueChartData} />
            <Typography
              align="center"
              variant="body2"
              style={{ marginTop: "1rem" }}
            >
              Valor acumulado vs restante
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box display="flex" gap={5}>
        <Card className="card">
          <CardContent>
            <Typography variant="h6">Resumo da Estratégia</Typography>
            <p>
              Guardando:{" "}
              <strong>R$ {MONTHLY_SAVINGS_BRL.toLocaleString()}</strong> por mês
            </p>
            <p>
              Data inicial: <strong>25/03/2025</strong>
            </p>
            <p>
              Meta de compra: <strong>26/10/2026</strong>
            </p>
            <p>
              Preço alvo do BTC: <strong>$1.000.000</strong>
            </p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progresso de Tempo
            </Typography>
            <Doughnut data={daysChartData} />
            <Typography
              align="center"
              variant="body2"
              style={{ marginTop: "1rem" }}
            >
              Dias corridos passados vs restantes
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card className="card">
        <CardContent>
          <Typography variant="h6">Ganhos Projetados (BTC a $1M)</Typography>
          <p>
            Por hora: <strong>R$ {hourlyRate.toFixed(2)}</strong>
          </p>
          <p>
            Por dia útil: <strong>R$ {dailyRate.toFixed(2)}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
