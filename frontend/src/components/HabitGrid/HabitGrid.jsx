import React, { useEffect, useState } from 'react';
import './HabitGrid.css';

const HabitGrid = ({ tasks }) => {
  const [gridData, setGridData] = useState([]);
  const [monthLabels, setMonthLabels] = useState([]);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    generateGridData();
  }, [tasks]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateGridData = () => {
    const days = [];
    const months = new Set();
    
    // Start from January 1, 2025
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      months.add(monthKey);

      // Find tasks completed on this date
      const completedTasks = tasks.filter(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        return taskDate === dateStr && task.completed;
      });

      const totalTasks = tasks.filter(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        return taskDate === dateStr;
      }).length;

      days.push({
        date: dateStr,
        completedTasks: completedTasks.length,
        totalTasks,
        weekDay: d.getDay()
      });
    }

    // Generate month labels
    const monthLabelArray = Array.from(months).map(monthKey => {
      const [year, month] = monthKey.split('-');
      return {
        key: monthKey,
        label: new Date(year, month - 1).toLocaleString('en-US', { month: 'short' })
      };
    });

    setMonthLabels(monthLabelArray);
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

  return (
    <div className="habit-grid">
      <h2>Your Progress</h2>
      <div className="grid-wrapper">
        <div className="month-labels">
          {monthLabels.map(month => (
            <div key={month.key} className="month-label">
              {month.label}
            </div>
          ))}
        </div>
        <div className="grid-container">
          {gridData.map((day) => (
            <div
              key={day.date}
              className={`grid-cell ${getColorIntensity(day)}`}
              title={`${formatDate(day.date)}: ${day.completedTasks} out of ${day.totalTasks} tasks completed`}
              style={{
                gridColumn: 'auto',
                gridRow: day.weekDay + 1
              }}
            />
          ))}
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
    </div>
  );
};

export default HabitGrid;