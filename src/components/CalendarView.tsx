import { HobbyLog } from '../types';
import { formatDuration } from '../utils/format';

interface Props {
  logs: HobbyLog[];
  color: string;
}

const WEEKS = 52;
const DAY_LABELS = ['月', '水', '金'];
const DAY_INDICES = [0, 2, 4];

function cellColor(duration: number, color: string): string {
  if (duration === 0) return '#e5e7eb';
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const alpha = duration <= 30 ? 0.3 : duration <= 60 ? 0.55 : duration <= 120 ? 0.8 : 1;
  return `rgba(${r},${g},${b},${alpha})`;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarView({ logs, color }: Props) {
  // Build duration map
  const durationMap: Record<string, number> = {};
  for (const log of logs) {
    durationMap[log.date] = (durationMap[log.date] || 0) + log.duration;
  }

  // Build 52 weeks × 7 days grid (oldest week first)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - WEEKS * 7 + 1);

  const weeks: { date: string; duration: number }[][] = [];
  const monthLabels: { weekIdx: number; label: string }[] = [];
  const d = new Date(startDate);

  for (let w = 0; w < WEEKS; w++) {
    const week: { date: string; duration: number }[] = [];
    for (let day = 0; day < 7; day++) {
      const dateStr = toDateStr(d);
      week.push({ date: dateStr, duration: durationMap[dateStr] || 0 });
      d.setDate(d.getDate() + 1);
    }
    // Month label on first week of month
    const firstDay = new Date(week[0].date + 'T00:00:00');
    if (w === 0 || week.some(cell => cell.date.slice(-2) === '01')) {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      monthLabels.push({ weekIdx: w, label: months[firstDay.getMonth()] });
    }
    weeks.push(week);
  }

  const CELL = 11;
  const GAP = 2;
  const STEP = CELL + GAP;

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div style={{ width: WEEKS * STEP + 24, position: 'relative' }}>
          {/* Month labels */}
          <div style={{ height: 16, position: 'relative', marginLeft: 24 }}>
            {monthLabels.map(({ weekIdx, label }) => (
              <span
                key={weekIdx}
                className="text-xs text-gray-400 absolute"
                style={{ left: weekIdx * STEP, fontSize: 10 }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5" style={{ marginLeft: 24 }}>
            {/* Day labels */}
            <div className="absolute left-0 flex flex-col" style={{ gap: GAP, top: 16 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ height: CELL, fontSize: 9, color: '#9ca3af', lineHeight: `${CELL}px` }}>
                  {DAY_INDICES.includes(i) ? DAY_LABELS[DAY_INDICES.indexOf(i)] : ''}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      title={cell.duration > 0 ? `${cell.date}: ${formatDuration(cell.duration)}` : cell.date}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 2,
                        backgroundColor: cellColor(cell.duration, color),
                        cursor: cell.duration > 0 ? 'pointer' : 'default',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-xs text-gray-400 mr-1">少</span>
        {[0, 0.3, 0.55, 0.8, 1].map((alpha, i) => {
          const hex = color.replace('#', '');
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          const bg = i === 0 ? '#e5e7eb' : `rgba(${r},${g},${b},${alpha})`;
          return <div key={i} style={{ width: CELL, height: CELL, borderRadius: 2, backgroundColor: bg }} />;
        })}
        <span className="text-xs text-gray-400 ml-1">多</span>
      </div>
    </div>
  );
}
