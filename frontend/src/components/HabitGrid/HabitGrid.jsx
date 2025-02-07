import React, { useEffect, useState } from 'react';
import './HabitGrid.css';

const HabitGrid = ({ tasks }) => {
  const [gridData, setGridData] = useState([]);
  const [monthLabels, setMonthLabels] = useState([]);
  const weekDays = ['Mon', 'Wed', 'Fri'];
  const [tooltipData, setTooltipData] = useState(null);

  useEffect(() => {
    generateGridData();
  }, [tasks]);

  const generateGridData = () => {
    const days = [];
    const months = [];
    
    // Start from January 1, 2025
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    let currentColumn = 0;
    
    // Fill in all dates for 2025
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Add month label at the start of each month
      if (d.getDate() === 1) {
        months.push({
          key: d.toISOString(),
          label: d.toLocaleString('en-US', { month: 'short' }),
          column: currentColumn
        });
      }

      const dateStr = d.toISOString().split('T')[0];

      // Find tasks completed on this date
      const completedTasks = tasks.filter(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        return taskDate === dateStr && task.completed;
      });

      const totalTasks = tasks.filter(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        return taskDate === dateStr;
      }).length;

      if (d.getDay() === 0) { // If it's Sunday, increment column
        currentColumn++;
      }

      days.push({
        date: dateStr,
        weekDay: (d.getDay() + 6) % 7, // Convert Sunday=0 to Monday=0
        column: currentColumn,
        completedTasks: completedTasks.length,
        totalTasks
      });
    }

    setMonthLabels(months);
    setGridData(days);
  };

  const getColorIntensity = (day) => {
    if (day.totalTasks === 0) return 'empty';
    const completionRate = day.completedTasks / day.totalTasks;
    if (completionRate === 0) return 'empty';
    if (completionRate <= 0.25) return 'intensity-1';
    if (completionRate <= 0.5) return 'intensity-2';
    if (completionRate <= 0.75) return 'intensity-3';
    return 'intensity-4';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="habit-grid">
      <h2>Your Progress</h2>
      <div className="grid-scroll-container">
        <div className="grid-wrapper">
          <div className="weekday-labels">
            {weekDays.map(day => (
              <div key={day} className="weekday-label">
                {day}
              </div>
            ))}
          </div>
          <div className="grid-content">
            <div className="month-labels">
              {monthLabels.map(month => (
                <div 
                  key={month.key}
                  className="month-label"
                  style={{ left: `${month.column * 18}px` }}
                >
                  {month.label}
                </div>
              ))}
            </div>
            <div className="grid-container">
              {gridData.map((day) => (
                <div
                  key={day.date}
                  className={`grid-cell ${getColorIntensity(day)}`}
                  onMouseEnter={(e) => {
                    const rect = e.target.getBoundingClientRect();
                    setTooltipData({
                      date: day.date,
                      completed: day.completedTasks,
                      total: day.totalTasks,
                      x: rect.left + window.scrollX,
                      y: rect.top + window.scrollY - 60
                    });
                  }}
                  onMouseLeave={() => setTooltipData(null)}
                  style={{
                    gridColumn: day.column + 1,
                    gridRow: day.weekDay + 1
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid-legend">
        <span>Less</span>
        <div className="legend-cells">
          <div className="grid-cell empty" />
          <div className="grid-cell intensity-1" />
          <div className="grid-cell intensity-2" />
          <div className="grid-cell intensity-3" />
          <div className="grid-cell intensity-4" />
        </div>
        <span>More</span>
      </div>
      {tooltipData && (
        <div 
          className="grid-tooltip"
          style={{ 
            left: tooltipData.x + 'px',
            top: tooltipData.y + 'px'
          }}
        >
          <div className="tooltip-date">{formatDate(tooltipData.date)}</div>
          <div className="tooltip-stats">
            {tooltipData.completed} tasks completed out of {tooltipData.total}
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitGrid;